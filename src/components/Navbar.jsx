import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiSearch, CiMenuFries, CiStar } from "react-icons/ci";
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Verificar status da sessão
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status", {
          credentials: "include"
        });
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setUser(null);
      }
    };

    // Verificar autenticação inicial
    checkAuth();

    // Adicionar listener para eventos de autenticação
    window.addEventListener("auth", checkAuth);

    return () => {
      window.removeEventListener("auth", checkAuth);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      
      // Atualizar estado
      setUser(null);
      
      // Disparar evento de autenticação
      window.dispatchEvent(new Event("auth"));
      
      // Redirecionar para home
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    // TODO: Implementar busca quando a API estiver pronta
    // Por enquanto, apenas redireciona para a página de notícias
    navigate("/Notices");
    console.log("Busca por:", searchQuery);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.nav_content}>
        <Link to="/" className={styles.logo}>
          <CiStar className={styles.logo_icon} />
          GEEKNEWS
        </Link>

        <div className={`${styles.nav_links} ${isMenuOpen ? styles.active : ""}`}>
          <Link to="/" className={styles.nav_link}>
            Início
          </Link>
          <Link to="/Notices" className={styles.nav_link}>
            Notícias
          </Link>
          <Link to="/lancamentos" className={styles.nav_link}>
            Lançamentos
          </Link>
          <Link to="/reviews" className={styles.nav_link}>
            Reviews
          </Link>
          <Link to="/About" className={styles.nav_link}>
            Sobre
          </Link>
        </div>

        <form onSubmit={handleSearch} className={styles.search_bar}>
          <CiSearch className={styles.search_icon} />
          <input
            type="text"
            placeholder="Buscar notícias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.search_input}
          />
        </form>

        <div className={styles.auth_buttons}>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className={styles.nav_link}>
                  Admin
                </Link>
              )}
              <div className={styles.user_menu}>
                <span className={styles.user_name}>Olá, {user.name}</span>
                <button onClick={handleLogout} className={styles.logout_button}>
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.login_button}>
                Entrar
              </Link>
              <Link to="/cadastro" className={styles.register_button}>
                Cadastrar
              </Link>
            </>
          )}
        </div>

        <button 
          className={`${styles.menu_button} ${isMenuOpen ? styles.active : ""}`}
          onClick={toggleMenu}
        >
          <CiMenuFries />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
