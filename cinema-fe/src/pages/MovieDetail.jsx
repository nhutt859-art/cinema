import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Calendar, Globe, Play, ChevronRight, MapPin, User, Video, Tag } from 'lucide-react'
import movieApi from '../api/movieApi'
import showtimeApi from '../api/showtimeApi'
import Badge from '../components/ui/Badge'
import Loading from '../components/ui/Loading'

const AGE_RATING_LABELS = {
  P: { label: 'KID', text: 'Phim dành cho khán giả mọi lứa tuổi' },
  T13: { label: 'TEEN', text: 'Phim dành cho khán giả từ đủ 13 tuổi trở lên (13+)' },
  T16: { label: 'TEEN', text: 'Phim dành cho khán giả từ đủ 16 tuổi trở lên (16+)' },
  T18: { label: 'ADULT', text: 'Phim dành cho khán giả từ đủ 18 tuổi trở lên (18+)' },
}

const AGE_BADGE_COLORS = {
  P: 'bg-green-500/20 text-green-400 border-green-500/30',
  T13: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  T16: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  T18: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function MovieDetail() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [expandedDesc, setExpandedDesc] = useState(false)
  const [startIndex, setStartIndex] = useState(0)
  const tabsRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      movieApi.getMovieDetail(id),
      showtimeApi.getShowtimesByMovie(id)
    ])
      .then(([movieRes, showtimeRes]) => {
        const movieData = movieRes.data.movie || movieRes.data
        setMovie(movieData)
        setShowtimes(showtimeRes.data || [])
      })
      .catch(() => setError('Không tìm thấy phim'))
      .finally(() => setLoading(false))
  }, [id])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dates = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    return d.toDateString()
  })

  const visibleDates = dates.slice(startIndex, startIndex + 7)

  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0])
    }
  }, [dates, selectedDate])

  const currentShowtimes = showtimes.filter(
    st => new Date(st.startTime).toDateString() === selectedDate
  )

  const trailerEmbed = movie?.trailerUrl?.includes('youtube.com/watch')
    ? movie.trailerUrl.replace('watch?v=', 'embed/')
    : movie?.trailerUrl?.includes('youtu.be')
      ? movie.trailerUrl.replace('youtu.be/', 'www.youtube.com/embed/')
      : movie?.trailerUrl

  const formatDateTab = (dateStr) => {
    const d = new Date(dateStr)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    return { day, month, weekday: weekdays[d.getDay()] }
  }

  if (loading) return <Loading />
  if (error) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-text-muted">{error}</div>
  if (!movie) return null

  const ratingInfo = AGE_RATING_LABELS[movie.ageRating] || { label: movie.ageRating, text: '' }

  return (
    <div className="min-h-screen">
      {/* Trailer Modal */}
      {showTrailer && trailerEmbed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white text-sm transition-colors"
            >
              Đóng [Esc]
            </button>
            <iframe
              src={trailerEmbed}
              title="Trailer"
              className="w-full h-full rounded-xl"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="text-text-muted hover:text-white transition-colors mb-4 flex items-center gap-1 text-sm group"
        >
          <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          Quay lại
        </button>

        {/* ===== MOVIE INFO ===== */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-80 lg:w-96 shrink-0"
          >
            <div className="relative group rounded-2xl overflow-hidden bg-white/5">
              <div className="aspect-[3/4]">
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold galaxy-text-gradient">{movie.title?.[0] || '?'}</span>
                  </div>
                )}
              </div>
              {trailerEmbed && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-galaxy-pink/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-lg shadow-galaxy-pink/30">
                    <Play size={28} className="text-white fill-white ml-1" />
                  </div>
                </button>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 min-w-0 space-y-3"
          >
            {/* Badges row - Cinestar style */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-block rounded-full border font-medium text-sm px-3 py-0.5 bg-white/10 text-text-secondary border-white/20">
                2D
              </span>
              {movie.ageRating && (
                <span className={`inline-block rounded-full border font-medium text-sm px-3 py-0.5 ${AGE_BADGE_COLORS[movie.ageRating] || 'bg-white/10 text-text-secondary border-white/20'}`}>
                  {movie.ageRating}
                </span>
              )}
              <span className={`inline-block rounded-full border font-medium text-sm px-3 py-0.5 ${AGE_BADGE_COLORS[movie.ageRating] || 'bg-white/10 text-text-secondary border-white/20'}`}>
                {ratingInfo.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white">{movie.title}</h1>

            {/* Meta info - mỗi dòng riêng */}
            <div className="space-y-1.5 text-base text-text-secondary">
              {movie.genres?.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-galaxy-cyan" />
                  <span className="text-white/60">Thể loại: </span>
                  {movie.genres.map(g => g.name || g).join(', ')}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-galaxy-cyan" />
                <span className="text-white/60">Thời lượng: </span>
                {movie.duration} phút
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-galaxy-cyan" />
                <span className="text-white/60">Ngôn ngữ: </span>
                {movie.languageDisplay || movie.language || 'Đang cập nhật'}
              </div>
            </div>

            {/* Age rating description - Cinestar style */}
            <p className="text-base text-text-muted italic">
              {movie.ageRating}: {ratingInfo.text}
            </p>

            {/* Divider */}
            <hr className="border-white/5" />

            {/* MÔ TẢ section - Cinestar style */}
            <div>
              <h3 className="text-base font-semibold text-text-muted uppercase tracking-widest mb-2">MÔ TẢ</h3>
              <div className="space-y-1.5 text-base text-text-secondary">
                {movie.director && (
                  <p>
                    <span className="text-white/60">Đạo diễn: </span>
                    {movie.director}
                  </p>
                )}
                {movie.actors && (
                  <p>
                    <span className="text-white/60">Diễn viên: </span>
                    {movie.actors}
                  </p>
                )}
                <p>
                  <span className="text-white/60">Khởi chiếu: </span>
                  {new Date(movie.showingStartDate).toLocaleDateString('vi-VN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* NỘI DUNG PHIM section - Cinestar style */}
            {movie.description && (
              <div>
                <h3 className="text-base font-semibold text-text-muted uppercase tracking-widest mb-2">NỘI DUNG PHIM</h3>
                <p className="text-lg text-text-secondary leading-relaxed">
                  {expandedDesc || movie.description.length <= 300
                    ? movie.description
                    : `${movie.description.slice(0, 300)}...`
                  }
                </p>
                {movie.description.length > 300 && (
                  <button
                    onClick={() => setExpandedDesc(!expandedDesc)}
                    className="text-galaxy-cyan hover:text-galaxy-cyan/80 text-sm font-medium mt-1 transition-colors"
                  >
                    {expandedDesc ? 'Thu gọn' : 'Xem thêm'}
                  </button>
                )}
              </div>
            )}

            {/* Trailer button */}
            {trailerEmbed && (
              <button
                onClick={() => setShowTrailer(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-galaxy-pink/30 text-galaxy-pink hover:bg-galaxy-pink/10 transition-all text-base font-medium"
              >
                <Video size={16} />
                Xem Trailer
              </button>
            )}
          </motion.div>
        </div>

        {/* ===== SHOWTIMES SECTION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {movie.status === 'COMING_SOON' ? (
            <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
              <span className="relative inline-flex">
                <Calendar size={18} className="text-galaxy-cyan/50" />
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-[130%] h-0.5 bg-red-400 rotate-45 origin-center block" />
                </span>
              </span>
              HIỆN CHƯA CÓ LỊCH CHIẾU
            </h2>
          ) : (
            <>
            <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
              <Calendar size={18} className="text-galaxy-cyan" />
              LỊCH CHIẾU
            </h2>
            <>
              {/* Date tabs với nút chuyển */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <button
                  onClick={() => setStartIndex(Math.max(0, startIndex - 7))}
                  disabled={startIndex === 0}
                  className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                    startIndex === 0
                      ? 'text-text-muted/20 cursor-not-allowed'
                      : 'text-text-secondary hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <ChevronRight size={16} className="rotate-180" />
                </button>

                <div
                  ref={tabsRef}
                  className="flex gap-2 overflow-x-auto"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {visibleDates.map((dateStr) => {
                    const globalIdx = dates.indexOf(dateStr)
                    const { day, month, weekday } = formatDateTab(dateStr)
                    const isActive = dateStr === selectedDate
                    const isDisabled = globalIdx >= 17

                    return (
                      <button
                        key={dateStr}
                        onClick={isDisabled ? undefined : () => setSelectedDate(dateStr)}
                        className={`shrink-0 flex flex-col items-center px-5 py-2.5 rounded-xl transition-all duration-200 ${
                          isDisabled
                            ? 'text-text-muted/30 border border-white/5 cursor-not-allowed'
                            : isActive
                              ? 'bg-galaxy-purple text-white shadow-lg shadow-galaxy-purple/25'
                              : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                      >
                        <span className="text-xs font-medium">{weekday}</span>
                        <span className="text-lg font-bold leading-tight">{day}/{month}</span>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setStartIndex(Math.min(dates.length - 7, startIndex + 7))}
                  disabled={startIndex + 7 >= dates.length}
                  className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                    startIndex + 7 >= dates.length
                      ? 'text-text-muted/20 cursor-not-allowed'
                      : 'text-text-secondary hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Showtime grid */}
              <div className="flex flex-wrap justify-center gap-3">
                {currentShowtimes.map(st => (
                  <Link
                    key={st.showtimeId}
                    to={`/booking/${st.showtimeId}`}
                    className="glass-card p-3 text-center hover:border-galaxy-purple/40 transition-all duration-200 group relative overflow-hidden w-28 lg:w-32"
                  >
                    <div className="absolute inset-0 bg-galaxy-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    <div className="relative z-10">
                      {/* Room */}
                      {st.roomName && (
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-galaxy-cyan mb-1.5 uppercase tracking-wide">
                          <MapPin size={10} />
                          {st.roomName}
                        </div>
                      )}
                      {/* Time */}
                      <p className="text-lg font-bold text-white group-hover:text-galaxy-pink transition-colors">
                        {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        ~{new Date(st.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {/* Price */}
                      <p className="text-sm font-bold text-galaxy-cyan mt-1.5">
                        {st.basePrice?.toLocaleString()}₫
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {currentShowtimes.length === 0 && (
                <div className="text-center text-text-muted py-8">
                  Không có suất chiếu trong ngày này
                </div>
              )}
            </>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
