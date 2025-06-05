import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiSearch, CiMenuFries } from "react-icons/ci";
import { CiStar } from "react-icons/ci";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.isAdmin) {
      setIsAdmin(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsAdmin(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_content}>
        <Link to="/" className={styles.logo}>
          <CiStar className={styles.logo_icon} />
          GEEKNEWS
        </Link>

        <div className={styles.nav_links}>
          <Link to="/" className={styles.nav_link}>
            Início
          </Link>
          <Link to="/noticias" className={styles.nav_link}>
            Notícias
          </Link>
          <Link to="/lancamentos" className={styles.nav_link}>
            Lançamentos
          </Link>
          <Link to="/reviews" className={styles.nav_link}>
            Reviews
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
          {isAdmin ? (
            <>
              <Link to="/admin" className={styles.nav_link}>
                Admin
              </Link>
              <button onClick={handleLogout} className={styles.login_button}>
                Sair
              </button>
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

        <button className={styles.menu_button}>
          <CiMenuFries />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
