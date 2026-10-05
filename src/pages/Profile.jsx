import { useState } from 'react'
import { BadgeCheck, Save, UserRound } from 'lucide-react'
import { Notice } from '../components/Notice'
import { useAuth } from '../contexts/useAuth'
import { PhoneInput } from '../components/PhoneInput'
import { formatPhone, isValidPhone, phoneDigits } from '../utils/phone'
import { WhatsAppIcon } from '../components/WhatsAppIcon'

const defaultWhatsAppMessage = 'Olá {nome_cliente}! Sobre o pedido #{id_pedido}: {produtos}. Total: {total}. {parcela_pendente} Obrigado!'

export function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState(() => ({
    username: user?.username || '',
    phone: phoneDigits(user?.phone),
    whatsapp_message: user?.whatsapp_message || defaultWhatsAppMessage,
  }))
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  async function save(event) {
    event.preventDefault()
    if (!isValidPhone(form.phone)) {
      setNotice({ type: 'error', message: 'Informe um telefone com DDD e 10 ou 11 números.' })
      return
    }
    setBusy(true)
    try {
      await updateProfile(form)
      setNotice({ message: 'Perfil atualizado.' })
    } catch (cause) {
      setNotice({ type: 'error', message: cause.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="animate-[settle-in_0.35s_ease_both]">
      <div className="mb-[27px] flex items-end justify-between gap-6 max-[620px]:mb-5 max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-4">
        <div>
          <span className={`text-[10px] font-bold tracking-[1px] text-[#839087] mb-[9px] block`}>CONTA</span>
          <h1 className="m-0 font-display text-[27px] font-bold leading-tight text-[#27342b] max-[620px]:text-2xl">Meu perfil</h1>
          <p className="mb-0 mt-2 text-base text-muted">Atualize seus dados e personalize as mensagens enviadas aos clientes.</p>
        </div>
      </div>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      <section className={`min-w-0 rounded-[5px] border border-[#e5e9e2] bg-white overflow-hidden p-0`}>
        <form className="grid" onSubmit={save}>
          <div className="flex items-center gap-4 bg-[#1b382c] px-7 py-6 text-white max-[620px]:flex-wrap max-[620px]:px-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#c9f36a] text-[#1b382c]"><UserRound size={25} /></div>
            <div className="grid min-w-0 gap-0.5">
              <span className="text-[10px] font-bold tracking-[1px] text-[#bfd0c1]">SUA CONTA</span>
              <h2 className="m-0 truncate font-display text-xl font-bold">{form.username || 'Seu perfil'}</h2>
              <span className="text-sm text-[#d1ddd2]">{user?.email || ''}</span>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#2b4b39] px-3 py-1.5 text-xs font-semibold text-[#d7f4b0] max-[620px]:ml-[72px]"><BadgeCheck size={16} /> Perfil pessoal</span>
          </div>
          <div className="grid grid-cols-2 gap-5 p-6 max-[760px]:grid-cols-1 max-[620px]:gap-3 max-[620px]:p-3">
            <section className="grid content-start gap-4 rounded-lg border border-[#e7ece5] bg-white p-5 max-[620px]:p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eff4eb] text-[#46664b]"><UserRound size={18} /></span>
                <div><h3 className="m-0 font-display text-base font-bold text-[#344238]">Dados pessoais</h3><p className="text-sm leading-relaxed text-[#7e897f]">Informações da sua conta de acesso.</p></div>
              </div>
              <div className="grid gap-4">
                <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                  Nome
                  <input className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none" value={form.username} maxLength={120} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
                </label>
                <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                  E-mail
                  <input className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none" type="email" value={user?.email || ''} disabled />
                </label>
                <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                  Telefone
                  <PhoneInput value={form.phone} onValueChange={(phone) => setForm({ ...form, phone })} autoComplete="tel" required aria-label="Telefone com DDD" />
                  {form.phone && <small className="text-xs font-normal text-[#819087]">Exibição: {formatPhone(form.phone)}</small>}
                </label>
              </div>
            </section>
            <section className="grid content-start gap-4 rounded-lg border border-[#e7ece5] bg-white p-5 max-[620px]:p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#1da851] text-[#25D366]"><WhatsAppIcon size={18} /></span>
                <div><h3 className="m-0 font-display text-base font-bold text-[#344238]">Cobrança pelo WhatsApp</h3><p className="text-sm leading-relaxed text-[#7e897f]">Personalize a mensagem preparada para cada pedido.</p></div>
              </div>
              <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                Modelo da mensagem
                <textarea
                  className="min-h-[140px] w-full resize-y rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                  rows={5}
                  maxLength={4000}
                  value={form.whatsapp_message}
                  onChange={(event) => setForm({ ...form, whatsapp_message: event.target.value })}
                />
              </label>
              <div className="grid gap-2 rounded-lg bg-[#f5f8f3] p-3 text-sm text-[#57665a]">
                <strong>Variáveis disponíveis</strong>
                <div className="flex flex-wrap gap-1.5">
                  {['{nome_cliente}', '{id_pedido}', '{produtos}', '{total}', '{parcelas}', '{parcela_pendente}', '{prazo_pagamento}'].map((variable) => <code key={variable}>{variable}</code>)}
                </div>
                <p className="text-sm leading-relaxed text-[#7e897f]">Cada variável será substituída pelos dados correspondentes do pedido.</p>
              </div>
            </section>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[#edf0eb] bg-[#fbfcfa] px-6 py-4 max-[620px]:flex-col max-[620px]:items-stretch max-[620px]:px-3">
            <span className="text-sm leading-relaxed text-[#7e897f]">As alterações ficam salvas somente na sua conta.</span>
            <button className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 bg-nexo text-white hover:bg-nexo-hover`} disabled={busy}>
              <Save size={16} /> {busy ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
