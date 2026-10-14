import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";

function AuthCard({ children, eyebrow = "ACESSO SEGURO", title, description }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f2] px-5 py-10">
      <section className="w-full max-w-[440px] rounded-2xl border border-[#e5eae2] bg-white p-8 shadow-[0_18px_55px_rgba(27,49,33,0.09)] max-[480px]:p-5">
        <div className="mb-7 flex items-center gap-2.5 font-display text-sm font-extrabold text-[#304236]"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#d7f483] text-lg text-[#1d3b2d]">n.</span> NEXO GESTÃO</div>
        <span className="text-[10px] font-bold tracking-[1px] text-[#839087]">{eyebrow}</span>
        <h1 className="mb-0 mt-2 font-display text-[26px] font-bold leading-tight text-[#29372e]">{title}</h1>
        <p className="mb-6 mt-2 text-sm leading-relaxed text-[#778178]">{description}</p>
        {children}
      </section>
    </main>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api.requestPasswordReset(email); setSent(true); }
    catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }
  return <AuthCard eyebrow="RECUPERAÇÃO DE CONTA" title={sent ? "Confira seu e-mail" : "Esqueceu sua senha?"} description={sent ? "Se esse endereço estiver cadastrado, enviaremos um link para criar uma nova senha. O link expira em uma hora." : "Informe o e-mail da sua conta. Vamos enviar um link seguro para você criar outra senha."}>
    {sent ? <div className="mb-5 flex items-center gap-2 rounded-lg bg-[#f0f7eb] p-3 text-sm text-[#456a49]"><CheckCircle2 size={18} /> Solicitação processada.</div> : <form className="grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-semibold text-[#3e4941]">E-mail<div className="flex h-11 items-center gap-2 rounded-lg border border-[#dfe5dd] px-3 text-[#879189] focus-within:border-[#789b70] focus-within:ring-2 focus-within:ring-[#e6f0e2]"><Mail size={17}/><input className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#29372e] outline-none" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></label>
      {error && <p className="m-0 text-sm text-[#b44438]" role="alert">{error}</p>}
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1d3b2d] px-4 text-sm font-bold text-white hover:bg-[#294e38] disabled:opacity-60" disabled={busy}>{busy ? "Enviando..." : "Enviar link de redefinição"}<ArrowRight size={16}/></button>
    </form>}
    <Link className="mt-5 inline-flex text-sm font-bold text-[#416b45] hover:underline" to="/login">Voltar para entrar</Link>
  </AuthCard>;
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api.resetPassword({ token, ...form }); navigate("/login", { replace: true, state: { notice: "Senha redefinida. Entre com sua nova senha." } }); }
    catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }
  return <AuthCard eyebrow="NOVA SENHA" title="Crie uma nova senha" description="Use pelo menos 10 caracteres, incluindo uma letra e um número.">
    {!token ? <p className="rounded-lg bg-[#fff2ee] p-3 text-sm text-[#a44b40]" role="alert">Este link está incompleto. Solicite uma nova redefinição.</p> : <form className="grid gap-4" onSubmit={submit}>
      {[ ["password", "Nova senha", "new-password"], ["confirmPassword", "Confirmar nova senha", "new-password"] ].map(([name, label, autoComplete]) => {
        const isConfirmation = name === "confirmPassword";
        const isVisible = isConfirmation ? showConfirmPassword : showPassword;
        const toggleVisibility = isConfirmation ? setShowConfirmPassword : setShowPassword;
        return <label key={name} className="grid gap-2 text-sm font-semibold text-[#3e4941]">{label}<div className="flex h-11 items-center gap-2 rounded-lg border border-[#dfe5dd] px-3 text-[#879189] focus-within:border-[#789b70] focus-within:ring-2 focus-within:ring-[#e6f0e2]"><LockKeyhole size={17}/><input className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#29372e] outline-none" type={isVisible ? "text" : "password"} name={name} autoComplete={autoComplete} minLength={10} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} required /><button type="button" className="grid h-8 w-8 shrink-0 place-items-center text-[#879189]" onClick={() => toggleVisibility((shown) => !shown)} aria-label={`${isVisible ? "Ocultar" : "Mostrar"} ${isConfirmation ? "confirmação de senha" : "senha"}`} aria-pressed={isVisible}>{isVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>;
      })}
      {error && <p className="m-0 text-sm text-[#b44438]" role="alert">{error}</p>}
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1d3b2d] px-4 text-sm font-bold text-white hover:bg-[#294e38] disabled:opacity-60" disabled={busy}>{busy ? "Salvando..." : "Salvar nova senha"}<ArrowRight size={16}/></button>
    </form>}
    <Link className="mt-5 inline-flex text-sm font-bold text-[#416b45] hover:underline" to="/login">Voltar para entrar</Link>
  </AuthCard>;
}
