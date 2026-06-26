$ErrorActionPreference = "Stop"

function Strip-Html {
    param([string]$html)
    if (-not $html) { return "" }
    $text = [System.Text.RegularExpressions.Regex]::Replace($html, '<[^>]+>', '')
    $text = $text.Replace("&amp;", "&").Replace("&lt;", "<").Replace("&gt;", ">").Replace("&quot;", '"')
    return $text.Trim()
}

function Get-Shows {
    param([int]$startPage, [int]$endPage)
    $shows = @()
    for ($page = $startPage; $page -le $endPage; $page++) {
        Write-Host "Fetching page $page..."
        try {
            $data = Invoke-RestMethod -Uri "https://api.tvmaze.com/shows?page=$page" -TimeoutSec 30
            $shows += $data
        } catch {
            $errMsg = $_.Exception.Message; Write-Warning ("Failed page " + $page + ": " + $errMsg)
        }
    }
    return $shows
}

function New-Uuid { return [System.Guid]::NewGuid().ToString() }

function Get-Duration {
    param($runtime)
    if (-not $runtime -or $runtime -le 0) { return 120 }
    $d = [Math]::Round($runtime * 1.5)
    if ($d -lt 80) { return 80 }
    if ($d -gt 200) { return 200 }
    return $d
}

# TVMaze genre -> slug
$tvToSlug = @{}
$mappings = @(
    @("action", "hanh-dong"), @("adventure", "hanh-dong"),
    @("comedy", "hai-huoc"), @("romance", "tinh-cam"),
    @("drama", "tinh-cam"), @("horror", "kinh-di"),
    @("science-fiction", "khoa-hoc-vien-tuong"), @("fantasy", "khoa-hoc-vien-tuong"),
    @("supernatural", "kinh-di"), @("thriller", "kinh-di"),
    @("mystery", "kinh-di"), @("crime", "toi-pham"),
    @("war", "hanh-dong"), @("history", "chinh-kich"),
    @("animation", "hoat-hinh"), @("anime", "hoat-hinh"),
    @("family", "hoat-hinh"), @("music", "hai-huoc"),
    @("musical", "hai-huoc"), @("sports", "hanh-dong"),
    @("western", "hanh-dong"), @("nature", "chinh-kich"),
    @("travel", "chinh-kich"), @("food", "hai-huoc"),
    @("medical", "chinh-kich"), @("legal", "chinh-kich"),
    @("reality", "hai-huoc")
)
foreach ($m in $mappings) { $tvToSlug[$m[0]] = $m[1] }

# Actual UUIDs from CinemaDB genres
$slugToId = @{
    "hanh-dong" = "5bd179a4-6292-4424-8dda-56d3f2f40152"
    "hai-huoc" = "ad0d02bc-a632-4113-bde7-5e4f6fe4edf6"
    "tinh-cam" = "1a409ed9-2b35-40b0-b677-14485b3c3db9"
    "kinh-di" = "649b127c-61ff-43fc-af78-296ab910d1f5"
    "khoa-hoc-vien-tuong" = "1cc4d0e1-6465-4b62-ba55-acfbe63d13cf"
    "hoat-hinh" = "9d56ed24-3baa-417b-afa4-985f62bcfc4f"
    "toi-pham" = "b0000001-0000-0000-0000-000000000007"
    "chinh-kich" = "b0000001-0000-0000-0000-000000000008"
}

Write-Host "Fetching shows from TVMaze pages 3-6..."
$allShows = Get-Shows -startPage 3 -endPage 6
Write-Host "Total fetched: $($allShows.Count)"

$candidates = $allShows | Where-Object {
    $_.runtime -gt 0 -and
    $_.image -and $_.image.medium -and
    $_.premiered -and
    $_.genres -and $_.genres.Count -gt 0
} | Sort-Object { $_.rating.average } -Descending

$selected = $candidates | Select-Object -First 30
Write-Host "Selected: $($selected.Count) shows"

$today = (Get-Date).ToString("yyyy-MM-dd")

$lines = New-Object System.Collections.ArrayList
$allMovieIds = New-Object System.Collections.ArrayList
[void]$lines.Add("-- Seed data from TVMaze API - 30 movies (batch 2)")
[void]$lines.Add("-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$lines.Add("")

$idx = 1
foreach ($show in $selected) {
    $movieId = New-Uuid
    [void]$allMovieIds.Add("    '$movieId'")
    $title = $show.name -replace "'", "''"
    $desc = Strip-Html $show.summary
    if ($desc.Length -gt 300) { $desc = $desc.Substring(0, 297) + "..." }
    $desc = $desc -replace "'", "''"
    $duration = Get-Duration $show.runtime
    $lang = $show.language
    if (-not $lang) { $lang = "English" }
    $lang = $lang -replace "'", "''"

    $rating = "P"
    $gl = $show.genres | ForEach-Object { $_.ToLower() }
    if ($gl -contains "horror" -or $gl -contains "adult") { $rating = "T18" }
    elseif ($gl -contains "crime" -or $gl -contains "thriller" -or $gl -contains "war") { $rating = "T16" }
    elseif ($gl -contains "drama" -or $gl -contains "action" -or $gl -contains "mystery") { $rating = "T13" }

    $poster = ($show.image.medium -replace "'", "''")

    [void]$lines.Add("-- $idx. $title")
    [void]$lines.Add("INSERT INTO movies (movie_id, title, description, duration, language, age_rating, trailer_url, poster_url, showing_start_date, showing_end_date, status) VALUES")
    [void]$lines.Add("    ('$movieId', '$title', '$desc', $duration, '$lang', '$rating', NULL, '$poster', '$today', '$today', 'ACTIVE')")
    [void]$lines.Add("ON CONFLICT DO NOTHING;")
    [void]$lines.Add("")

    $genreIds = @()
    foreach ($g in $show.genres) {
        $slug = $tvToSlug[$g.ToLower()]
        if ($slug -and $slugToId.ContainsKey($slug)) {
            $genreIds += $slugToId[$slug]
        }
    }
    $genreIds = $genreIds | Select-Object -Unique

    if ($genreIds.Count -gt 0) {
        [void]$lines.Add("INSERT INTO movie_genres (movie_id, genre_id) VALUES")
        $vals = @()
        foreach ($gid in $genreIds) {
            $vals += "    ('$movieId', '$gid')"
        }
        [void]$lines.Add(($vals -join ","))
        [void]$lines.Add("ON CONFLICT DO NOTHING;")
        [void]$lines.Add("")
    }

    $idx++
}

# Add showing_end_date update at the end
[void]$lines.Add("-- Update showing dates for all batch 2 movies")
[void]$lines.Add("UPDATE movies SET showing_start_date = CURRENT_DATE - INTERVAL '10 days', showing_end_date = CURRENT_DATE + INTERVAL '45 days'")
[void]$lines.Add("WHERE movie_id IN (")
[void]$lines.Add(($allMovieIds -join ","))
[void]$lines.Add(");")
[void]$lines.Add("")

[void]$lines.Add("-- End of seed data (batch 2)")
$content = $lines -join "`r`n"
$path = "C:\Users\lapto\Project\cinema\database\seed_tvmaze_batch2.sql"
$content | Out-File -FilePath $path -Encoding utf8
Write-Host "SQL saved to: $path"
