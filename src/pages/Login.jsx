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
import { tw } from "../components/tw";

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
    <main className={tw.authScreen}>
      <section className={tw.authPanel}>
        <div className={tw.authBrand}>
          <span className={tw.brandMark}>n.</span>
          <span>
            NEXO <small className={tw.brandSubtitle}>GESTÃO</small>
          </span>
        </div>
        <div className={tw.authCopy}>
          <span className={`${tw.eyebrow} ${tw.authEyebrow}`}>
            OPERAÇÃO, EM ORDEM
          </span>
          <h1 className={tw.authTitle}>
            {creatingAccount
              ? "Seu negócio, no mesmo ritmo."
              : "Bom ter você de volta."}
          </h1>
          <p className={tw.authSubtitle}>
            Clientes, estoque e pedidos conectados em um só lugar.
          </p>
        </div>
        <div className={tw.authFoot}>
          <span className={tw.authOrbit} />
          GESTÃO CLARA. DECISÕES MELHORES.
        </div>
      </section>
      <section className={tw.authFormSide}>
        <div className={tw.authFormWrap}>
          <div className={tw.mobileBrand}>
            <span className={`${tw.brandMark} ${tw.mobileBrandMark}`}>n.</span>{" "}
            NEXO GESTÃO
          </div>
          <span className={`${tw.eyebrow} mb-3.25 block`}>
            {creatingAccount ? "COMECE POR AQUI" : "ÁREA DE ACESSO"}
          </span>
          <h2 className={tw.authFormTitle}>
            {creatingAccount ? "Criar conta" : "Entrar na sua conta"}
          </h2>
          <p className={tw.muted}>
            {creatingAccount
              ? "Configure seu acesso para começar."
              : "Acesse seu espaço de trabalho."}
          </p>
          <form className={tw.form} onSubmit={submit}>
            {creatingAccount && (
              <label className={tw.formLabel}>
                Nome completo
                <div className={tw.inputWrap}>
                  <UserRound size={17} />
                  <input
                    className={tw.authInput}
                    autoComplete="name"
                    name="username"
                    value={form.username}
                    onChange={update}
                    required
                  />
                </div>
              </label>
            )}
            <label className={tw.formLabel}>
              E-mail
              <div className={tw.inputWrap}>
                <Mail size={17} />
                <input
                  className={tw.authInput}
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
              <label className={tw.formLabel}>
                Telefone
                <div className={tw.inputWrap}>
                  <UserRound size={17} />
                  <input
                    className={tw.authInput}
                    autoComplete="tel"
                    name="phone"
                    value={form.phone}
                    onChange={update}
                    required
                  />
                </div>
              </label>
            )}
            <label className={tw.formLabel}>
              Senha
              <div className={tw.inputWrap}>
                <LockKeyhole size={17} />
                <input
                  className={tw.authInput}
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
              <label className={tw.formLabel}>
                Confirmar senha
                <div className={tw.inputWrap}>
                  <LockKeyhole size={17} />
                  <input
                    className={tw.authInput}
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
              <p className={tw.error} role="alert">
                {error}
              </p>
            )}
            <button
              className={`${tw.button} ${tw.buttonPrimary} ${tw.authSubmit}`}
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
            className={`${tw.buttonText} ${tw.authToggle}`}
            onClick={() => {
              setCreatingAccount(!creatingAccount);
              setError("");
            }}
          >
            {creatingAccount
              ? "Já tem acesso? Entrar"
              : "Primeiro acesso? Criar conta"}
          </button>
          <span className={tw.authSecure}>
            <PackageOpen size={15} /> Seus dados protegidos por sessão segura
          </span>
        </div>
      </section>
    </main>
  );
}
