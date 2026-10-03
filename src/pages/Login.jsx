import { useState } from "react";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  PackageOpen,
  UserRound,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { PhoneInput } from "../components/PhoneInput";
import { isValidPhone } from "../utils/phone";
export function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  if (user) return <Navigate to="/dashboard" replace />;

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (creatingAccount && !isValidPhone(form.phone)) {
      setError("Informe um telefone com DDD e 10 ou 11 números.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (creatingAccount) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate("/dashboard", { replace: true });
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-[minmax(380px,0.92fr)_1.08fr] bg-white max-[620px]:grid-cols-1">
      <section className="auth-pattern relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-nexo px-[8.3%] py-11 text-[#f1f5ef] max-[620px]:hidden">
        <div className="flex items-center gap-3 font-display text-[17px] font-extrabold leading-none">
          <span className="inline-grid h-[42px] w-[42px] place-items-center rounded-[9px] bg-nexo-lime font-display text-2xl font-extrabold leading-none text-nexo">n.</span>
          <span>
            NEXO <small className="mt-1 block text-[9px] font-semibold tracking-[1px] text-[#9eafa2]">GESTÃO</small>
          </span>
        </div>
        <div className="my-auto max-w-[510px] py-[70px]">
          <span className={`text-[10px] font-bold tracking-[1px] text-[#839087] text-nexo-lime`}>
            OPERAÇÃO, EM ORDEM
          </span>
          <h1 className="mb-4 mt-[22px] max-w-[460px] font-display text-[48px] font-bold leading-[1.12]">
            {creatingAccount
              ? "Seu negócio, no mesmo ritmo."
              : "Bom ter você de volta."}
          </h1>
          <p className="m-0 max-w-[370px] text-base leading-[1.7] text-[#bdc9bf]">
            Clientes, estoque e pedidos conectados em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-bold tracking-[1px] text-[#9eafa2]">
          <span className="auth-orbit-dot relative h-[27px] w-[27px] rounded-full border border-[#78927f]" />
          GESTÃO CLARA. DECISÕES MELHORES.
        </div>
      </section>
      <section className="grid place-items-center px-[7%] py-12 max-[620px]:min-h-screen max-[620px]:items-start max-[620px]:px-6 max-[620px]:py-[30px]">
        <div className="my-auto w-full max-w-[405px] animate-[settle-in_0.45s_ease_both]">
          <div className="mb-[50px] hidden items-center gap-[9px] font-display text-xs font-extrabold text-[#304236] max-[620px]:flex">
            <span className={`inline-grid h-[42px] w-[42px] place-items-center rounded-[9px] bg-nexo-lime font-display text-2xl font-extrabold leading-none text-nexo h-8 w-8 text-[19px]`}>n.</span>{" "}
            NEXO GESTÃO
          </div>
          <span className={`text-[10px] font-bold tracking-[1px] text-[#839087] mb-3.25 block`}>
            {creatingAccount ? "COMECE POR AQUI" : "ÁREA DE ACESSO"}
          </span>
          <h2 className="m-0 font-display text-[29px] font-bold leading-tight">
            {creatingAccount ? "Criar conta" : "Entrar na sua conta"}
          </h2>
          <p className="mb-7 mt-[10px] text-base text-muted">
            {creatingAccount
              ? "Configure seu acesso para começar."
              : "Acesse seu espaço de trabalho."}
          </p>
          <form className="grid gap-[17px]" onSubmit={submit}>
            {creatingAccount && (
              <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                Nome completo
                <div className="flex h-[46px] items-center gap-2.5 rounded-[5px] border border-[#dfe5dd] px-[13px] text-[#879189]">
                  <UserRound size={17} />
                  <input
                    className="h-full w-full border-0 bg-transparent text-base text-ink outline-none focus-visible:outline-none"
                    autoComplete="name"
                    name="username"
                    value={form.username}
                    onChange={update}
                    required
                  />
                </div>
              </label>
            )}
            <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
              E-mail
              <div className="flex h-[46px] items-center gap-2.5 rounded-[5px] border border-[#dfe5dd] px-[13px] text-[#879189]">
                <Mail size={17} />
                <input
                  className="h-full w-full border-0 bg-transparent text-base text-ink outline-none focus-visible:outline-none"
                  type="email"
                  autoComplete="email"
                  name="email"
                  value={form.email}
                  onChange={update}
                  required
                />
              </div>
            </label>
            {creatingAccount && (
              <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                Telefone
                <div className="flex h-[46px] items-center gap-2.5 rounded-[5px] border border-[#dfe5dd] px-[13px] text-[#879189]">
                  <UserRound size={17} />
                  <PhoneInput
                    className="h-full w-full border-0 bg-transparent text-base text-ink outline-none focus-visible:outline-none"
                    autoComplete="tel"
                    name="phone"
                    value={form.phone}
                    onValueChange={(phone) => {
                      setForm((current) => ({ ...current, phone }));
                      setError("");
                    }}
                    required
                  />
                </div>
              </label>
            )}
            <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
              Senha
              <div className="flex h-[46px] items-center gap-2.5 rounded-[5px] border border-[#dfe5dd] px-[13px] text-[#879189]">
                <LockKeyhole size={17} />
                <input
                  className="h-full w-full border-0 bg-transparent text-base text-ink outline-none focus-visible:outline-none"
                  type="password"
                  autoComplete={
                    creatingAccount ? "new-password" : "current-password"
                  }
                  name="password"
                  value={form.password}
                  onChange={update}
                  required
                  minLength={creatingAccount ? 10 : 1}
                />
              </div>
            </label>
            {creatingAccount && (
              <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                Confirmar senha
                <div className="flex h-[46px] items-center gap-2.5 rounded-[5px] border border-[#dfe5dd] px-[13px] text-[#879189]">
                  <LockKeyhole size={17} />
                  <input
                    className="h-full w-full border-0 bg-transparent text-base text-ink outline-none focus-visible:outline-none"
                    type="password"
                    autoComplete="new-password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={update}
                    required
                    minLength={10}
                  />
                </div>
              </label>
            )}
            {error && (
              <p className="m-0 text-sm text-[#b44438]" role="alert">
                {error}
              </p>
            )}
            <button
              className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 bg-nexo text-white hover:bg-nexo-hover mt-1 min-h-[47px] w-full justify-between px-4`}
              type="submit"
              disabled={busy}
            >
              {busy
                ? "Aguarde..."
                : creatingAccount
                  ? "Criar minha conta"
                  : "Acessar painel"}{" "}
              <ArrowRight size={17} />
            </button>
          </form>
          <button
            className={`inline-flex items-center justify-center gap-1.5 border-0 bg-transparent p-[5px] text-base font-bold text-[#365b42] hover:text-[#70913f] mt-[18px] pl-0`}
            onClick={() => {
              setCreatingAccount(!creatingAccount);
              setError("");
            }}
          >
            {creatingAccount
              ? "Já tem acesso? Entrar"
              : "Primeiro acesso? Criar conta"}
          </button>
          <span className="mt-[38px] flex flex-col gap-4 md:flex md:items-start md:gap-[7px] text-[13px] text-[#8b958d]">
            <PackageOpen size={18} /> Seus dados protegidos por sessão segura
          </span>
        </div>
      </section>
    </main>
  );
}
