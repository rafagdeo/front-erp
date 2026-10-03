import { CircleCheck, CircleAlert, X } from 'lucide-react'
import { tw } from './tw'

export function Notice({ notice, onClose }) {
  if (!notice) return null
  const Icon = notice.type === 'error' ? CircleAlert : CircleCheck
  return <div className={`${tw.notice} ${notice.type === 'error' ? tw.noticeError : ''}`} role="status"><Icon size={18} /><span className={tw.noticeMessage}>{notice.message}</span><button className={tw.noticeDismiss} aria-label="Fechar aviso" onClick={onClose}><X size={16} /></button></div>
}