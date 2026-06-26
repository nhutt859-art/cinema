import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Clock, XCircle, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import adminApi from '../../api/adminApi'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Loading from '../../components/ui/Loading'

export default function AdminShowtimes() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 12
  const [form, setForm] = useState({ movieId: '', roomId: '', startTime: '', basePrice: 75000 })
  const [selectedIds, setSelectedIds] = useState(new Set())

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'showtimes', currentPage],
    queryFn: () => adminApi.getShowtimes({ page: currentPage, size: pageSize }).then(r => {
      setTotalPages(r.data?.totalPages || 0)
      return r.data
    }),
  })

  const { data: moviesData } = useQuery({
    queryKey: ['admin', 'movies', 'all'],
    queryFn: () => adminApi.getMovies({ page: 0, size: 100 }).then(r => r.data?.content || []),
  })

  const { data: roomsData } = useQuery({
    queryKey: ['admin', 'rooms'],
    queryFn: () => adminApi.getRooms().then(r => r.data),
  })

  const showtimes = data?.content || data || []
  const movies = moviesData || []
  const rooms = (roomsData || []).filter(r => r.status === 'ACTIVE')

  const cancelableIds = showtimes.filter(st => st.status !== 'CANCELLED').map(st => st.showtimeId)
  const allSelected = cancelableIds.length > 0 && cancelableIds.every(id => selectedIds.has(id))

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(cancelableIds))
    }
  }

  const handleSelectOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleBatchCancel = async () => {
    if (!window.confirm(`Hủy ${selectedIds.size} suất chiếu đã chọn?`)) return
    await adminApi.batchCancelShowtimes([...selectedIds])
    setSelectedIds(new Set())
    queryClient.invalidateQueries({ queryKey: ['admin', 'showtimes'] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (new Date(form.startTime) < new Date()) {
        alert('Không thể thêm suất chiếu vào thời gian đã qua')
        return
      }
      const movie = movies.find(m => m.movieId === form.movieId)
      const duration = movie?.duration || 120
      const start = new Date(form.startTime)
      const end = new Date(start.getTime() + (duration + 10) * 60000)
      const pad2 = (n) => String(n).padStart(2, '0')
      const endTime = `${end.getFullYear()}-${pad2(end.getMonth() + 1)}-${pad2(end.getDate())}T${pad2(end.getHours())}:${pad2(end.getMinutes())}`

      await adminApi.createShowtime({
        movie: { movieId: form.movieId },
        room: { roomId: form.roomId },
        startTime: form.startTime,
        endTime,
        basePrice: Number(form.basePrice),
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'showtimes'] })
      setShowForm(false)
      setForm({ movieId: '', roomId: '', startTime: '', basePrice: 75000 })
    } catch (err) {
      alert(err.response?.data || 'Có lỗi xảy ra khi tạo suất chiếu')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Hủy suất chiếu này?')) return
    await adminApi.cancelShowtime(id)
    queryClient.invalidateQueries({ queryKey: ['admin', 'showtimes'] })
  }

  if (isLoading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock size={24} className="text-galaxy-cyan" /> Quản lý Suất chiếu</h1>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2"><Plus size={16} /> Thêm suất chiếu</Button>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Thêm suất chiếu">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-text-secondary">Phim</label>
            <select value={form.movieId} onChange={(e) => setForm(p => ({ ...p, movieId: e.target.value }))} className="input-field mt-1 bg-space-dark" style={{ colorScheme: 'dark' }} required>
              <option value="" className="bg-space-dark text-white">-- Chọn phim --</option>
              {movies.map(m => <option key={m.movieId} value={m.movieId} className="bg-space-dark text-white">{m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-text-secondary">Phòng</label>
            <select value={form.roomId} onChange={(e) => setForm(p => ({ ...p, roomId: e.target.value }))} className="input-field mt-1 bg-space-dark" style={{ colorScheme: 'dark' }} required>
              <option value="" className="bg-space-dark text-white">-- Chọn phòng --</option>
              {rooms.map(r => <option key={r.roomId} value={r.roomId} className="bg-space-dark text-white">{r.roomName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-text-secondary">Thời gian bắt đầu</label>
            <input type="datetime-local" value={form.startTime} onChange={(e) => setForm(p => ({ ...p, startTime: e.target.value }))} className="input-field mt-1" required />
          </div>
          {form.movieId && form.startTime && (
            <div>
              <label className="text-sm text-text-secondary">Thời gian kết thúc (tự động)</label>
              <input type="datetime-local"
                value={(() => {
                  const movie = movies.find(m => m.movieId === form.movieId)
                  const duration = movie?.duration || 120
                  const start = new Date(form.startTime)
                  const end = new Date(start.getTime() + (duration + 10) * 60000)
                  const pad2 = (n) => String(n).padStart(2, '0')
                  return `${end.getFullYear()}-${pad2(end.getMonth() + 1)}-${pad2(end.getDate())}T${pad2(end.getHours())}:${pad2(end.getMinutes())}`
                })()}
                className="input-field mt-1 opacity-60" disabled />
            </div>
          )}
          <div>
            <label className="text-sm text-text-secondary">Giá vé (VNĐ)</label>
            <input type="number" value={form.basePrice} onChange={(e) => setForm(p => ({ ...p, basePrice: e.target.value }))} className="input-field mt-1" min={0} required />
          </div>
          <Button type="submit" className="w-full">Lưu</Button>
        </form>
      </Modal>

      <div className="glass-card overflow-hidden">
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-galaxy-purple/10 border-b border-galaxy-purple/20">
            <span className="text-sm text-galaxy-cyan font-medium">Đã chọn {selectedIds.size} suất chiếu</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedIds(new Set())} className="text-xs text-text-muted hover:text-white transition-colors">Bỏ chọn</button>
              <button onClick={handleBatchCancel} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"><Trash2 size={14} /> Hủy tất cả</button>
            </div>
          </div>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="p-4 w-10">
                <input type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="accent-galaxy-cyan cursor-pointer"
                />
              </th>
              <th className="text-left p-4">Phim</th>
              <th className="text-left p-4 hidden md:table-cell">Phòng</th>
              <th className="text-left p-4">Bắt đầu</th>
              <th className="text-left p-4 hidden md:table-cell">Kết thúc</th>
              <th className="text-right p-4 hidden lg:table-cell">Giá vé</th>
              <th className="text-right p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map((st, i) => {
              const isCancelled = st.status === 'CANCELLED'
              return (
                <motion.tr key={st.showtimeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isCancelled ? 'opacity-40' : ''}`}>
                  <td className="p-4">
                    <input type="checkbox"
                      checked={selectedIds.has(st.showtimeId)}
                      onChange={() => handleSelectOne(st.showtimeId)}
                      disabled={isCancelled}
                      className="accent-galaxy-cyan cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-medium">{st.movieTitle || st.movie?.title}</td>
                  <td className="p-4 hidden md:table-cell text-text-muted">{st.roomName || st.room?.roomName}</td>
                  <td className="p-4 text-galaxy-cyan">{new Date(st.startTime).toLocaleString('vi-VN')}</td>
                  <td className="p-4 hidden md:table-cell text-text-muted">{new Date(st.endTime).toLocaleString('vi-VN')}</td>
                  <td className="p-4 text-right hidden lg:table-cell">{st.basePrice?.toLocaleString()}₫</td>
                  <td className="p-4 text-right">
                    {!isCancelled && (
                      <button onClick={() => handleCancel(st.showtimeId)} className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 ml-auto text-xs"><XCircle size={14} /> Hủy</button>
                    )}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all text-sm"
          >
            <ChevronLeft size={14} /> Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                i === currentPage
                  ? 'bg-galaxy-cyan text-space-dark'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all text-sm"
          >
            Sau <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
