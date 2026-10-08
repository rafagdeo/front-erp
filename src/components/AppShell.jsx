import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes,
  ChartNoAxesCombined,
  ChevronDown,
  CircleUserRound,
  Command,
  LogOut,
  Menu,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/useAuth";
const navigation = [
  { to: "/dashboard", label: "Visão geral", icon: ChartNoAxesCombined },
  { to: "/dashboard/orders", label: "Pedidos", icon: ShoppingBag },
  { to: "/dashboard/products", label: "Produtos", icon: Boxes },
  { to: "/dashboard/clients", label: "Clientes", icon: Users },
  { to: "/dashboard/profile", label: "Meu perfil", icon: CircleUserRound },
];

const pageNames = {
  "/dashboard": "Visão geral",
  "/orders": "Pedidos",
  "/products": "Produtos",
  "/clients": "Clientes",
  "/profile": "Meu perfil",
};

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 850px)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 850px)");
    const handleChange = (event) => setIsMobile(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen">
      {menuOpen && (
        <button
          className="fixed inset-0 z-[55] block h-full w-full border-0 bg-[rgba(14,27,18,0.36)] min-[851px]:hidden"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        style={{ translate: isMobile && !menuOpen ? "-101% 0" : "0 0" }}
        className="fixed inset-y-0 left-0 z-[60] flex h-screen min-h-screen w-[270px] shrink-0 flex-col overflow-y-auto bg-nexo px-[17px] pb-[18px] pt-[26px] text-[#eaf0e8] shadow-[18px_0_38px_rgba(10,25,15,0.15)] transition-[translate] duration-200 min-[851px]:z-[60] min-[851px]:w-[248px] min-[851px]:shadow-none max-[1100px]:min-[851px]:w-[220px]"
      >
        <div className="flex w-full items-center gap-3 px-[5px] font-display text-sm font-extrabold leading-none">
          <span
            className={`inline-grid h-[42px] w-[42px] place-items-center rounded-[9px] bg-nexo-lime font-display text-2xl font-extrabold leading-none text-nexo h-9 w-9 rounded-lg text-[21px]`}
          >
            n.
          </span>
          <div>
            NEXO{" "}
            <small className="mt-1 block text-[9px] font-semibold tracking-[1px] text-[#9eafa2]">
              GESTÃO
            </small>
          </div>
          <button
            className={`inline-grid h-[34px] w-[34px] place-items-center rounded border border-transparent bg-transparent text-[#647067] hover:border-[#e5e9e2] hover:bg-[#f8faf6] hover:text-nexo hidden max-[850px]:ml-auto max-[850px]:inline-grid max-[850px]:text-[#c8d5c9] min-[851px]:hidden`}
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="mx-2 mb-[11px] mt-[37px] block text-[9px] font-bold tracking-[1px] text-[#819489]">
          ESPAÇO DE TRABALHO
        </div>
        <div className="flex min-w-0 items-center gap-2.5 rounded-[5px] border border-[#385646] bg-[#244433] p-[9px] px-2">
          <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded bg-nexo-lime font-display text-sm font-bold text-[#244433]">
            {(user?.username || "N").charAt(0).toUpperCase()}
          </span>
          <span className="grid min-w-0 flex-1 gap-1">
            <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-[#f1f5ef]">
              {user?.username || "Minha empresa"}
            </strong>
            <small className="text-xs text-[#9eafa2]">Plano essencial</small>
          </span>
          <ChevronDown size={15} className="text-[#91a195]" />
        </div>
        <nav className="grid gap-1" aria-label="Navegação principal">
          <span className="mb-2 ml-2 mt-[31px] block text-[9px] font-bold tracking-[1px] text-[#819489]">
            GESTÃO
          </span>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `relative flex min-h-[42px] items-center gap-[11px] rounded px-[11px] text-base font-medium text-[#b7c4b9] transition hover:bg-[#294735] hover:text-white ${isActive ? "bg-[#2a4937] text-nexo-lime hover:bg-[#2a4937] hover:text-nexo-lime" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="flex items-center gap-2.5 border-y border-[#355443] px-[9px] py-3">
            <span className="grid h-[30px] w-[30px] place-items-center rounded border border-[#486451] text-nexo-lime">
              <Command size={16} />
            </span>
            <span className="grid gap-1">
              <strong className="text-xs text-[#eaf0e8]">
                Seu negócio em foco
              </strong>
              <small className="text-[11px] text-[#9eafa2]">
                Visão simples. Ação rápida.
              </small>
            </span>
          </div>
          <button
            className="mt-[9px] flex min-h-[39px] w-full items-center gap-2.5 border-0 bg-transparent px-[9px] text-left text-base text-[#b7c4b9] hover:text-white justify-center"
            onClick={signOut}
          >
            <LogOut size={17} /> Sair da conta
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 flex flex-col min-[851px]:ml-[248px] max-[1100px]:min-[851px]:ml-[220px]">
        <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-[#e5e9e2] bg-[rgba(255,255,255,0.83)] px-[38px] max-[1100px]:px-[26px] max-[850px]:gap-3 max-[620px]:h-14 max-[620px]:basis-14 max-[620px]:px-[15px]">
          <button
            className={`inline-grid h-[34px] w-[34px] place-items-center rounded border border-transparent bg-transparent text-[#647067] hover:border-[#e5e9e2] hover:bg-[#f8faf6] hover:text-nexo hidden max-[850px]:inline-grid max-[850px]:-ml-2 min-[851px]:hidden`}
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="mr-auto flex items-center gap-[11px] text-sm text-[#899189]">
            <span>Workspace</span>
            <span className="text-[#c0c7c1]">/</span>
            <strong className="font-semibold text-[#344138]">
              {pageNames[location.pathname] || "Visão geral"}
            </strong>
          </div>
          <div className="flex items-center gap-[9px] text-sm text-[#59655c]">
            <span className="mr-0.5 h-[7px] w-[7px] rounded-full bg-[#83ba67] shadow-[0_0_0_3px_#eaf3e4]" />
            <span className="max-[620px]:hidden">
              {user?.username || "Usuário"}
            </span>
            <div className="ml-[3px] grid h-[30px] w-[30px] place-items-center rounded-full bg-[#eaf0e7] text-[#55705e]">
              <CircleUserRound size={18} />
            </div>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1500px] flex-1 px-[38px] pb-[22px] pt-9 max-[1100px]:px-[26px] max-[620px]:px-4 max-[620px]:pb-[15px] max-[620px]:pt-[26px] max-[390px]:px-3">
          {children}
        </div>
        <footer className="flex justify-between px-[38px] pb-[19px] pt-[14px] text-xs text-[#959e96] max-[1100px]:px-[26px] max-[620px]:px-4 max-[620px]:pb-4 max-[620px]:pt-3 max-[620px]:text-[10px]">
          <span className="font-bold tracking-[.8px]">NEXO GESTÃO</span>
          <span>Seu negócio, bem acompanhado.</span>
        </footer>
      </main>
    </div>
  );
}
