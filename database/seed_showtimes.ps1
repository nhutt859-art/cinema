$ErrorActionPreference = "Stop"
$pgpass = "29072009tara"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$db = "CinemaDB"

function Query {
    param([string]$sql)
    $env:PGPASSWORD = $pgpass
    $r = & $psql -U postgres -d $db -t -A -c $sql 2>&1 | Out-String
    return $r.Trim()
}

function New-Uuid { return [System.Guid]::NewGuid().ToString() }

Write-Host "Fetching movies..."
$nowShowingRaw = Query "SELECT m.movie_id, m.title, m.duration, m.showing_end_date::text FROM movies m WHERE m.showing_start_date <= CURRENT_DATE AND m.showing_end_date >= CURRENT_DATE AND m.status = 'ACTIVE' ORDER BY RANDOM()"
$nowShowingMovies = @()
foreach ($line in ($nowShowingRaw -split "`n" | Where-Object { $_ -ne "" })) {
    $parts = $line -split "\|"
    if ($parts.Count -ge 4) {
        $nowShowingMovies += [PSCustomObject]@{
            id = $parts[0].Trim()
            title = $parts[1].Trim()
            duration = [Math]::Max(80, [Math]::Min(200, [int]$parts[2].Trim()))
            endDate = $parts[3].Trim()
        }
    }
}
Write-Host "Now-showing: $($nowShowingMovies.Count)"

$comingSoonRaw = Query "SELECT m.movie_id, m.title, m.duration, m.showing_start_date::text FROM movies m WHERE m.status = 'COMING_SOON' ORDER BY RANDOM()"
$comingSoonMovies = @()
foreach ($line in ($comingSoonRaw -split "`n" | Where-Object { $_ -ne "" })) {
    $parts = $line -split "\|"
    if ($parts.Count -ge 4) {
        $comingSoonMovies += [PSCustomObject]@{
            id = $parts[0].Trim()
            title = $parts[1].Trim()
            duration = [Math]::Max(80, [Math]::Min(200, [int]$parts[2].Trim()))
            startDate = $parts[3].Trim()
        }
    }
}
Write-Host "Coming-soon: $($comingSoonMovies.Count)"

$roomsRaw = Query "SELECT room_id, room_name FROM rooms ORDER BY room_name"
$rooms = @()
foreach ($line in ($roomsRaw -split "`n" | Where-Object { $_ -ne "" })) {
    $parts = $line -split "\|"
    if ($parts.Count -ge 2) {
        $rooms += [PSCustomObject]@{
            id = $parts[0].Trim()
            name = $parts[1].Trim()
        }
    }
}
Write-Host "Rooms: $($rooms.Count)"

# Time slots for each room
$slotDefs = @(
    @("08:00", "10:00", "13:00", "15:00", "18:00", "20:00"),
    @("09:00", "11:00", "14:00", "16:00", "19:00", "21:00")
)

$lines = New-Object System.Collections.ArrayList
[void]$lines.Add("-- Auto-generated showtimes")
[void]$lines.Add("-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$lines.Add("")

$totalInserted = 0
$usedKeys = @{}  # "roomId|day|time"

function Add-Showtime {
    param($movieId, $dayStr, $roomIdx, $slotIdx)
    $room = $rooms[$roomIdx]
    $startTimeStr = $slotDefs[$roomIdx][$slotIdx]
    $key = "$($room.id)|$dayStr|$startTimeStr"
    if ($usedKeys.ContainsKey($key)) { return $false }
    
    $startDt = [DateTime]::ParseExact("$dayStr $startTimeStr", "yyyy-MM-dd HH:mm", $null)
    $duration = (Get-Random -Minimum 80 -Maximum 120)
    $endDt = $startDt.AddMinutes($duration)
    
    # Check overlap with other showtimes in same room on same day
    foreach ($k in $usedKeys.Keys) {
        $parts = $k -split "\|"
        if ($parts[0] -eq $room.id -and $parts[1] -eq $dayStr) {
            $otherStart = [DateTime]::ParseExact("$dayStr $($parts[2])", "yyyy-MM-dd HH:mm", $null)
            $otherEnd = $otherStart.AddMinutes(110)
            if (($startDt -lt $otherEnd) -and ($endDt -gt $otherStart)) {
                return $false
            }
        }
    }
    
    $sid = New-Uuid
    $hour = $startDt.Hour
    $price = if ($hour -lt 12) { 65000 } elseif ($hour -lt 17) { 75000 } else { 85000 }
    
    $usedKeys[$key] = $true
    $endTimeStr = $endDt.ToString("HH:mm")
    
    [void]$lines.Add("INSERT INTO showtimes (showtime_id, movie_id, room_id, start_time, end_time, base_price, status) VALUES")
    [void]$lines.Add("    ('$sid', '$movieId', '$($room.id)', '$dayStr ${startTimeStr}:00+07', '$dayStr ${endTimeStr}:00+07', $price, 'ACTIVE')")
    [void]$lines.Add("ON CONFLICT DO NOTHING;")
    return $true
}

# Assign now-showing movies: 3 showtimes each over 14 days
Write-Host "Assigning now-showing showtimes..."
$numDays = 14
$today = [DateTime]::Today

foreach ($movie in $nowShowingMovies) {
    $movieEnd = [DateTime]::Parse($movie.endDate)
    $maxDayOffset = [Math]::Min($numDays - 1, [Math]::Max(0, ($movieEnd - $today).Days))
    
    $count = 0
    $attempts = 0
    while ($count -lt 3 -and $attempts -lt 100) {
        $attempts++
        $dayOffset = Get-Random -Minimum 0 -Maximum ($maxDayOffset + 1)
        $day = $today.AddDays($dayOffset).ToString("yyyy-MM-dd")
        $roomIdx = Get-Random -Minimum 0 -Maximum $rooms.Count
        $slotIdx = Get-Random -Minimum 0 -Maximum $slotDefs[$roomIdx].Count
        
        if (Add-Showtime -movieId $movie.id -dayStr $day -roomIdx $roomIdx -slotIdx $slotIdx) {
            $count++
            $totalInserted++
        }
    }
}

[void]$lines.Add("-- Total showtimes: $totalInserted")
$content = $lines -join "`r`n"
$path = "C:\Users\lapto\Project\cinema\database\seed_showtimes.sql"
$content | Out-File -FilePath $path -Encoding utf8
Write-Host "Generated $totalInserted showtimes -> $path"
