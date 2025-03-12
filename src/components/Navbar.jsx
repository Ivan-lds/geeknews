import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CiPaperplane } from "react-icons/ci";
import { CiGrid2H } from "react-icons/ci";
import { CiLogin } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";
import styles from "./Navbar.module.css";

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userRole");
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      {isAdmin ? (
        <nav className={styles.navbar}>
          <div className={styles.menu}>
            <button>
              <CiGrid2H />
            </button>
            <h2>
              <Link to={`/`}>
                GEEK<span>NEWS</span>
              </Link>
            </h2>
          </div>
          <ul>
            <div className={styles.search_container_admin}>
              <input
                className={styles.search_input}
                type="search"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch} // Captura a tecla "Enter"
              />
              <button onClick={handleSearch}>
                <CiPaperplane />
              </button>
            </div>
            <li className={styles.li_admin}>
              <Link to={`/`}>Home</Link>
            </li>
            <li className={styles.li_admin}>
              <Link to={`/new`} className={styles.new_btn}>
                Novo Post
              </Link>
            </li>
            <li className={styles.li_admin}>
              <Link to={`/admin`}>Gerenciar</Link>
            </li>
            <li className={styles.li_admin}>
              <button onClick={handleLogout}>
                <CiLogout />
              </button>
            </li>
          </ul>
        </nav>
      ) : (
        <nav className={styles.navbar}>
          <div className={styles.menu}>
            <button>
              <CiGrid2H />
            </button>
            <h2>
              <Link to={`/`}>
                GEEK<span>NEWS</span>
              </Link>
            </h2>
          </div>
          <div className={styles.search_container}>
            <input
              className={styles.search_input}
              type="search"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch} // Captura a tecla "Enter"
            />
            <button onClick={handleSearch}>
              <CiPaperplane />
            </button>
          </div>
          <ul>
            <li>
              <Link to={`/`}>Home</Link>
            </li>
            <li>
              <Link to={`/animes`} className={styles.new_btn}>
                Animes
              </Link>
            </li>
            <li>
              <Link to={`/personagens`}>Personagens</Link>
            </li>
            <li className={styles.button_login}>
              {userEmail ? (
                <button onClick={handleLogout}>
                  <CiLogout />
                </button>
              ) : (
                <Link to={`/login`}>
                  <CiLogin />
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default Navbar;
