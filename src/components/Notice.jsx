import { useEffect, useRef } from 'react'
import { CircleCheck, CircleAlert, X } from 'lucide-react'
export function Notice({ notice, onClose }) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => onCloseRef.current(), 2000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  if (!notice) return null
  const Icon = notice.type === 'error' ? CircleAlert : CircleCheck
  return <div className={`fixed right-0 top-[-25px] z-[120] flex min-h-[46px] max-w-[min(440px,calc(100vw-32px))] items-center gap-2.5 rounded border border-[#d6e8d1] bg-[#f4faf0] px-[11px] py-[9px] text-base text-[#406b45] shadow-[0_5px_20px_rgba(28,54,35,0.1)] animate-[settle-in_0.2s_ease_both] max-[620px]:right-3 max-[620px]:top-[66px] max-[620px]:max-w-[calc(100vw-24px)] ${notice.type === 'error' ? "border-[#f0d6d0] bg-[#fff6f3] text-[#a94f42]" : ''}`} role="status"><Icon size={18} /><span className="flex-1">{notice.message}</span><button className="grid h-[25px] w-[25px] place-items-center rounded-sm border-0 bg-transparent p-0 text-inherit hover:bg-[rgba(0,0,0,0.05)]" aria-label="Fechar aviso" onClick={onClose}><X size={16} /></button></div>
}