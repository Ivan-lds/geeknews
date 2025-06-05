import { Link } from "react-router-dom";
import { CiMail, CiChat1, CiPhone } from "react-icons/ci";
import { CiFacebook, CiTwitter, CiInstagram, CiYoutube } from "react-icons/ci";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer_content}>
        {/* Sobre o Site */}
        <section className={styles.footer_section}>
          <h3>Sobre o GEEKNEWS</h3>
          <p>
            Seu portal de notícias sobre animes, mangás e cultura geek. Mantenha-se
            atualizado com as últimas novidades do mundo otaku.
          </p>
          <div className={styles.social_links}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <CiFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <CiTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <CiInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <CiYoutube />
            </a>
          </div>
        </section>

        {/* Links Úteis */}
        <section className={styles.footer_section}>
          <h3>Links Úteis</h3>
          <ul>
            <li>
              <Link to="/sobre">Sobre Nós</Link>
            </li>
            <li>
              <Link to="/contato">Contato</Link>
            </li>
            <li>
              <Link to="/privacidade">Política de Privacidade</Link>
            </li>
            <li>
              <Link to="/termos">Termos de Uso</Link>
            </li>
          </ul>
        </section>

        {/* Categorias */}
        <section className={styles.footer_section}>
          <h3>Categorias</h3>
          <ul>
            <li>
              <Link to="/categoria/noticias">Notícias</Link>
            </li>
            <li>
              <Link to="/categoria/lancamentos">Lançamentos</Link>
            </li>
            <li>
              <Link to="/categoria/reviews">Reviews</Link>
            </li>
            <li>
              <Link to="/categoria/guias">Guias</Link>
            </li>
          </ul>
        </section>

        {/* Contato */}
        <section className={styles.footer_section}>
          <h3>Contato</h3>
          <ul className={styles.contact_info}>
            <li>
              <CiMail />
              contato@geeknews.com.br
            </li>
            <li>
              <CiChat1 />
              Discord: GEEKNEWS
            </li>
            <li>
              <CiPhone />
              WhatsApp: (11) 99999-9999
            </li>
          </ul>
        </section>
      </div>

      {/* Copyright */}
      <div className={styles.footer_bottom}>
        <p>
          &copy; {new Date().getFullYear()} GEEKNEWS. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 