import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="z-40 border-t border-b border-[#242524] text-white py-2">
      <div className="container lg:w-[1680] mx-auto justify-between flex items-center">
        <div className="w-1/3">
          <Link to="/" className="flex align-center gap-4">
            <img src="/src/assets/images/favicon.webp" alt="Logo Rafael Guilherme - Desenvolvimento de Sites e Sistemas" width={55} />
          </Link>
        </div>
        <div className="w-2/3 align-center flex gap-4 justify-end">
            <nav className="flex items-center gap-8">
                <Link to={'/'}>
                    Início
                </Link>
                <Link to={'/Sobre'}>
                    Sobre
                </Link>
                <Link to={'/Projetos'}>
                    Projetos
                </Link>
            </nav>
            <Link to="/contact" className="bg-[#1d4ed8] flex justify-center rounded-lg px-8 py-2 hover:bg-[#1C4ED8DB] font-medium">
                Entre em contato
            </Link>
        </div>
      </div>
    </header>
  );
}
