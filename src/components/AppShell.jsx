import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Boxes, ChartNoAxesCombined, ChevronDown, CircleUserRound, Command, LogOut, Menu, ShoppingBag, Users, X } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { tw } from './tw'

const navigation = [
  { to: '/dashboard', label: 'Visão geral', icon: ChartNoAxesCombined },
  { to: '/orders', label: 'Pedidos', icon: ShoppingBag },
  { to: '/products', label: 'Produtos', icon: Boxes },
  { to: '/clients', label: 'Clientes', icon: Users },
]

const pageNames = { '/dashboard': 'Visão geral', '/orders': 'Pedidos', '/products': 'Produtos', '/clients': 'Clientes' }

export function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 850px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 850px)')
    const handleChange = (event) => setIsMobile(event.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  async function signOut() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={tw.appLayout}>
      {menuOpen && <button className={tw.mobileScrim} aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
      <aside style={{ translate: isMobile && !menuOpen ? '-101% 0' : '0 0' }} className={tw.sidebar}>
        <div className={tw.sidebarBrand}><span className={`${tw.brandMark} ${tw.sidebarBrandMark}`}>n.</span><div>NEXO <small className={tw.brandSubtitle}>GESTÃO</small></div><button className={`${tw.iconButton} ${tw.mobileClose} min-[851px]:hidden`} aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
        <div className={tw.workspaceLabel}>ESPAÇO DE TRABALHO</div>
        <div className={tw.workspaceSwitch}><span className={tw.workspaceSymbol}>{(user?.username || 'N').charAt(0).toUpperCase()}</span><span className={tw.workspaceText}><strong className={tw.workspaceName}>{user?.username || 'Minha empresa'}</strong><small className={tw.workspacePlan}>Plano essencial</small></span><ChevronDown size={15} className="text-[#91a195]" /></div>
        <nav className={tw.primaryNav} aria-label="Navegação principal">
          <span className={tw.navSectionNested}>GESTÃO</span>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `${tw.navLink} ${isActive ? tw.navLinkActive : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={tw.sidebarBottom}>
          <div className={tw.sidebarTip}><span className={tw.tipIcon}><Command size={16} /></span><span className={tw.tipText}><strong className={tw.tipTitle}>Seu negócio em foco</strong><small className={tw.tipDescription}>Visão simples. Ação rápida.</small></span></div>
          <button className={tw.logout} onClick={signOut}><LogOut size={17} /> Sair da conta</button>
        </div>
      </aside>
      <main className={tw.mainArea}>
        <header className={tw.topbar}>
          <button className={`${tw.iconButton} ${tw.mobileMenu} min-[851px]:hidden`} aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <div className={tw.breadcrumbs}><span>Workspace</span><span className={tw.breadcrumbSlash}>/</span><strong className={tw.breadcrumbStrong}>{pageNames[location.pathname] || 'Visão geral'}</strong></div>
          <div className={tw.topbarUser}><span className={tw.presence} /><span className="max-[620px]:hidden">{user?.username || 'Usuário'}</span><div className={tw.userAvatar}><CircleUserRound size={18} /></div></div>
        </header>
        <div className={tw.pageContent}>{children}</div>
        <footer className={tw.appFooter}><span className="font-bold tracking-[.8px]">NEXO GESTÃO</span><span>Seu negócio, bem acompanhado.</span></footer>
      </main>
    </div>
  )
}