import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Home, Trash2, Pencil } from 'lucide-react'
import adminApi from '../../api/adminApi'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Loading from '../../components/ui/Loading'

export default function AdminRooms() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ roomName: '', totalRows: 5, totalColumns: 10 })
  const [rowSeatTypes, setRowSeatTypes] = useState({})
  const [editModal, setEditModal] = useState(false)
  const [editRoom, setEditRoom] = useState(null)
  const [editName, setEditName] = useState('')

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['admin', 'rooms'],
    queryFn: () => adminApi.getRooms().then(r => r.data),
  })

  const { data: seatTypes } = useQuery({
    queryKey: ['admin', 'seatTypes'],
    queryFn: () => adminApi.getSeatTypes().then(r => r.data),
  })

  useEffect(() => {
    if (!seatTypes?.length) return
    const defaultId = seatTypes[0].seatTypeId
    setRowSeatTypes(prev => {
      const next = { ...prev }
      for (let i = 0; i < form.totalRows; i++) {
        const label = String.fromCharCode(65 + i)
        if (!next[label]) next[label] = defaultId
      }
      Object.keys(next).forEach(k => {
        if (k.charCodeAt(0) - 65 >= form.totalRows) delete next[k]
      })
      return next
    })
  }, [form.totalRows, seatTypes])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await adminApi.createRoom({
      roomName: form.roomName,
      totalRows: form.totalRows,
      totalColumns: form.totalColumns,
      rowSeatTypes,
    })
    queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] })
    setShowForm(false)
  }

  const handleDeactivate = async (id) => {
    if (!window.confirm('Vô hiệu hóa phòng này?')) return
    await adminApi.updateRoom(id, { status: 'INACTIVE' })
    queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] })
  }

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Xóa vĩnh viễn phòng này? Hành động này không thể hoàn tác!')) return
    try {
      await adminApi.deleteRoom(id)
      queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] })
    } catch (err) {
      alert(err.response?.data?.error || 'Xóa phòng thất bại')
    }
  }

  const handleEdit = (room) => {
    setEditRoom(room)
    setEditName(room.roomName)
    setEditModal(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    await adminApi.updateRoom(editRoom.roomId || editRoom.id, { roomName: editName })
    queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] })
    setEditModal(false)
    setEditRoom(null)
  }

  if (isLoading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Home size={24} className="text-galaxy-cyan" /> Quản lý Phòng chiếu</h1>
        <Button onClick={() => { setShowForm(!showForm); setRowSeatTypes({}) }} className="flex items-center gap-2"><Plus size={16} /> Thêm phòng</Button>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Thêm phòng" className="max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div><label className="text-sm text-text-secondary">Tên phòng</label><input type="text" value={form.roomName} onChange={(e) => setForm(p => ({ ...p, roomName: e.target.value }))} className="input-field mt-1" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm text-text-secondary">Số hàng</label><input type="number" value={form.totalRows} onChange={(e) => setForm(p => ({ ...p, totalRows: +e.target.value }))} className="input-field mt-1" min={1} /></div>
                <div><label className="text-sm text-text-secondary">Số cột</label><input type="number" value={form.totalColumns} onChange={(e) => setForm(p => ({ ...p, totalColumns: +e.target.value }))} className="input-field mt-1" min={1} /></div>
              </div>

              {seatTypes ? (
                <div>
                  <label className="text-sm text-text-secondary mb-2 block">Cấu hình loại ghế theo hàng</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {Array.from({ length: form.totalRows }, (_, i) => {
                      const rowLabel = String.fromCharCode(65 + i)
                      const currentTypeId = rowSeatTypes[rowLabel] || seatTypes[0]?.seatTypeId
                      const st = seatTypes.find(t => t.seatTypeId === currentTypeId)
                      return (
                        <div key={rowLabel} className="flex items-center gap-2">
                          <span className="text-sm text-text-muted w-14 shrink-0">Hàng {rowLabel}</span>
                          <select
                            value={currentTypeId}
                            onChange={(e) => setRowSeatTypes(p => ({ ...p, [rowLabel]: e.target.value }))}
                            className="input-field bg-space-dark flex-1"
                            style={{ colorScheme: 'dark' }}
                          >
                            {seatTypes.map(t => (
                              <option key={t.seatTypeId} value={t.seatTypeId} className="bg-space-dark text-white">{t.typeName}</option>
                            ))}
                          </select>
                          <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: st?.colorHex || '#fff' }} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-muted">Đang tải cấu hình ghế...</p>
              )}

              <Button type="submit" className="w-full">Tạo phòng</Button>
            </div>

            <div className="glass-card p-4 flex flex-col items-center justify-center">
              <div className="h-2 rounded-full bg-gradient-to-r from-galaxy-purple to-galaxy-cyan w-3/4 mb-2" />
              <p className="text-[10px] text-text-muted tracking-widest mb-4">MÀN HÌNH CHIẾU</p>

              <div className="overflow-x-auto w-full">
                <div className="inline-flex flex-col gap-1 mx-auto" style={{ minWidth: Math.max(form.totalColumns * 32, 120) }}>
                  {Array.from({ length: form.totalRows }, (_, ri) => {
                    const rowLabel = String.fromCharCode(65 + ri)
                    const typeId = rowSeatTypes[rowLabel] || seatTypes?.[0]?.seatTypeId
                    const st = seatTypes?.find(t => t.seatTypeId === typeId)
                    const color = st?.colorHex || '#4CAF50'
                    const isCouple = st?.typeName === 'Couple'
                    return (
                      <div key={rowLabel} className="flex items-center gap-1">
                        <span className="text-[10px] text-text-muted w-4 text-center shrink-0">{rowLabel}</span>
                        {isCouple ? (
                          Array.from({ length: Math.floor(form.totalColumns / 2) }, (_, ci) => {
                            const first = ci * 2 + 1
                            const second = first + 1
                            return (
                              <div
                                key={ci}
                                className="h-[22px] rounded-sm flex items-center justify-center text-[8px] font-medium"
                                style={{ backgroundColor: color, color: '#fff', width: 46 }}
                                title={`${rowLabel}${first}-${rowLabel}${second}`}
                              >
                                {first}-{second}
                              </div>
                            )
                          })
                        ) : (
                          Array.from({ length: form.totalColumns }, (_, ci) => (
                            <div
                              key={ci}
                              className="w-[22px] h-[22px] rounded-sm flex items-center justify-center text-[8px] font-medium"
                              style={{ backgroundColor: color, color: '#fff' }}
                              title={`${rowLabel}${ci + 1}`}
                            >
                              {ci + 1}
                            </div>
                          ))
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                {seatTypes?.map(t => (
                  <div key={t.seatTypeId} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.colorHex }} />
                    <span className="text-[10px] text-text-muted">{t.typeName}</span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-text-muted mt-2">
                {form.totalRows} hàng x {form.totalColumns} cột = {form.totalRows * form.totalColumns} ghế
              </p>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={editModal} onClose={() => { setEditModal(false); setEditRoom(null) }} title="Sửa tên phòng">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary">Tên phòng</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field mt-1" required autoFocus />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => { setEditModal(false); setEditRoom(null) }}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(rooms || []).map((room, i) => (
          <motion.div key={room.roomId || room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-semibold truncate">{room.roomName}</h3>
                {room.status === 'ACTIVE' && (
                  <button onClick={() => handleEdit(room)} className="text-text-muted hover:text-white transition-colors shrink-0">
                    <Pencil size={14} />
                  </button>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${room.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{room.status}</span>
            </div>
            <p className="text-xs text-text-muted mt-1">{room.totalRows} hàng x {room.totalColumns} cột = {room.totalRows * room.totalColumns} ghế</p>
            <div className="mt-3">
              {room.status === 'ACTIVE' ? (
                <button onClick={() => handleDeactivate(room.roomId || room.id)} className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1 transition-colors"><Trash2 size={14} /> Vô hiệu hóa</button>
              ) : (
                <button onClick={() => handlePermanentDelete(room.roomId || room.id)} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"><Trash2 size={14} /> Xóa vĩnh viễn</button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
