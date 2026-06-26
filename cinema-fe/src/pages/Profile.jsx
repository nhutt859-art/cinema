import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, Edit2, Save, X, ChevronRight, Lock } from 'lucide-react'
import authApi from '../api/authApi'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Loading from '../components/ui/Loading'

export default function Profile() {
  const { user, updateUser, loading: authLoading } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', gender: '', dateOfBirth: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const startEditing = () => {
    setForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth || '',
    })
    setEditing(true)
    setError('')
    setErrors({})
    setSuccess(false)
  }

  const handleSave = async () => {
    setError('')
    setErrors({})
    const newErrors = {}
    if (form.phone && !/^0\d{9}$/.test(form.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10 số, bắt đầu bằng 0'
    }
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth)
      const cutoff = new Date()
      cutoff.setFullYear(cutoff.getFullYear() - 12)
      if (dob > cutoff) {
        newErrors.dateOfBirth = 'Bạn phải đủ 12 tuổi'
      }
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v !== '')
      )
      const res = await authApi.updateProfile(payload)
      updateUser(res.data)
      setSuccess(true)
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  const validatePassword = (pw) => {
    if (!pw) return 'Vui lòng nhập mật khẩu'
    if (pw.length < 6) return 'Mật khẩu tối thiểu 6 ký tự'
    if (!/[A-Z]/.test(pw)) return 'Mật khẩu phải có chữ hoa'
    if (!/[a-z]/.test(pw)) return 'Mật khẩu phải có chữ thường'
    if (!/\d/.test(pw)) return 'Mật khẩu phải có số'
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return 'Mật khẩu phải có ký tự đặc biệt'
    return null
  }

  const handleChangePassword = async () => {
    setPwError('')
    setPwErrors({})

    const errs = {}
    if (!pwForm.currentPassword) errs.currentPassword = 'Vui lòng nhập mật khẩu hiện tại'
    const pwErr = validatePassword(pwForm.newPassword)
    if (pwErr) errs.newPassword = pwErr
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp'

    if (Object.keys(errs).length) {
      setPwErrors(errs)
      return
    }

    setPwSaving(true)
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwSuccess(true)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowChangePw(false)
    } catch (err) {
      setPwError(err.response?.data?.error || 'Đổi mật khẩu thất bại')
    } finally {
      setPwSaving(false)
    }
  }

  if (authLoading) return <Loading />

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button onClick={() => window.history.back()} className="text-text-muted hover:text-white transition-colors mb-6 flex items-center gap-1">
        <ChevronRight size={16} className="rotate-180" /> Quay lại
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card p-8 space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-button-glow flex items-center justify-center mx-auto text-2xl font-bold mb-3">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!editing && (
              <h1 className="text-xl font-bold">{user?.fullName}</h1>
            )}
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm text-center">Cập nhật thành công!</div>}

          {!editing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <Mail size={16} className="text-text-muted" />
                <div><p className="text-xs text-text-muted">Email</p><p className="text-sm">{user?.email}</p></div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <Phone size={16} className="text-text-muted" />
                <div><p className="text-xs text-text-muted">Số điện thoại</p><p className="text-sm">{user?.phone || '-'}</p></div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <User size={16} className="text-text-muted" />
                <div><p className="text-xs text-text-muted">Giới tính</p><p className="text-sm">{user?.gender || '-'}</p></div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <Calendar size={16} className="text-text-muted" />
                <div><p className="text-xs text-text-muted">Ngày sinh</p><p className="text-sm">{user?.dateOfBirth || '-'}</p></div>
              </div>
              <Button onClick={startEditing} className="w-full flex items-center justify-center gap-2 mt-4">
                <Edit2 size={16} /> Chỉnh sửa
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input label="Họ tên" value={form.fullName} onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))} />
              <div><label className="text-sm text-text-secondary">Email</label><p className="text-text-muted text-sm mt-1">{user?.email}</p></div>
              <Input label="Số điện thoại" type="tel" value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} error={errors.phone} />
              <div className="space-y-1.5">
                <label className="text-sm text-text-secondary">Giới tính</label>
                <select value={form.gender} onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value }))} className="input-field" style={{ colorScheme: 'dark' }}>
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <Input label="Ngày sinh" type="date" value={form.dateOfBirth} onChange={(e) => setForm(prev => ({ ...prev, dateOfBirth: e.target.value }))} error={errors.dateOfBirth} />
              <div className="flex gap-3 mt-4">
                <Button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2">
                  <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu'}
                </Button>
                <Button variant="secondary" onClick={() => setEditing(false)} className="flex items-center justify-center gap-2">
                  <X size={16} /> Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2"><Lock size={16} className="text-galaxy-pink" /> Mật khẩu</h2>
            {!showChangePw && (
              <Button onClick={() => { setShowChangePw(true); setPwSuccess(false); setPwError(''); setPwErrors({}) }} className="text-sm">
                Đổi mật khẩu
              </Button>
            )}
          </div>

          {pwError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center mb-4">{pwError}</div>}
          {pwSuccess && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm text-center mb-4">Đổi mật khẩu thành công!</div>}

          {showChangePw && (
            <div className="space-y-4">
              <Input label="Mật khẩu hiện tại" type="password" value={pwForm.currentPassword}
                onChange={(e) => setPwForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                error={pwErrors.currentPassword} />
              <Input label="Mật khẩu mới" type="password" value={pwForm.newPassword}
                onChange={(e) => setPwForm(prev => ({ ...prev, newPassword: e.target.value }))}
                error={pwErrors.newPassword} />
              <Input label="Xác nhận mật khẩu" type="password" value={pwForm.confirmPassword}
                onChange={(e) => setPwForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                error={pwErrors.confirmPassword} />
              <div className="flex gap-3 mt-4">
                <Button onClick={handleChangePassword} disabled={pwSaving} className="flex-1 flex items-center justify-center gap-2">
                  {pwSaving ? 'Đang lưu...' : 'Lưu'}
                </Button>
                <Button variant="secondary" onClick={() => { setShowChangePw(false); setPwErrors({}); setPwError('') }} className="flex items-center justify-center gap-2">
                  <X size={16} /> Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
