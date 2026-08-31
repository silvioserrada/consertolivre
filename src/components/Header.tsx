import { Link, NavLink, useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import { useAuth, signOut } from "../lib/useAuth";

const navLink = "text-sm font-medium transition-colors hover:text-copper-bright";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg tracking-tight">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-charcoal text-paper">
            <Wrench size={16} strokeWidth={2} />
          </span>
          conserto<span className="text-copper-bright">livre</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-7">
          <NavLink to="/" end className={({ isActive }) => `${navLink} ${isActive ? "text-copper-bright" : "text-charcoal"}`}>
            Encontrar técnico
          </NavLink>
          <NavLink to="/classificados" className={({ isActive }) => `${navLink} ${isActive ? "text-copper-bright" : "text-charcoal"}`}>
            Classificados
          </NavLink>
          {!user && (
            <NavLink to="/cadastro" className={({ isActive }) => `${navLink} ${isActive ? "text-copper-bright" : "text-charcoal"}`}>
              Sou técnico
            </NavLink>
          )}
        </nav>

        {user ? (
          <div className="hidden sm:flex items-center gap-4">
            <Link to={`/tecnico/${user.id}`} className="text-sm font-medium hover:text-copper-bright transition-colors">
              Meu perfil
            </Link>
            <button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="text-sm font-medium text-steel hover:text-signal transition-colors"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-copper-bright transition-colors">
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="text-sm font-medium bg-charcoal text-paper px-4 py-2 hover:bg-copper transition-colors"
            >
              Criar perfil
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
