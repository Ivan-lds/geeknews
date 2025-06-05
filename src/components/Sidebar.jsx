import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CiStar, CiGrid31, CiLink } from "react-icons/ci";
import blogFetch from "../axios/config";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const [popularPosts, setPopularPosts] = useState([]);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const response = await blogFetch.get("/Notices");
        const data = response.data;
        setPopularPosts(data.slice(0, 3));
      } catch (error) {
        console.error("Erro ao buscar posts populares:", error);
      }
    };

    fetchPopularPosts();
  }, []);

  const topAnimes = [
    { id: 1, title: "Fullmetal Alchemist: Brotherhood", rating: "9.9" },
    { id: 2, title: "Steins;Gate", rating: "9.8" },
    { id: 3, title: "Death Note", rating: "9.7" },
    { id: 4, title: "Attack on Titan", rating: "9.6" },
    { id: 5, title: "Hunter x Hunter", rating: "9.5" },
    { id: 6, title: "One Punch Man", rating: "9.4" },
    { id: 7, title: "Dragon Ball Super", rating: "9.3" },
    { id: 8, title: "Jujutsu Kaisen", rating: "9.2" }
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Posts Populares */}
      <section className={styles.sidebar_section}>
        <h3>
          <CiStar /> Posts Populares
        </h3>
        <div className={styles.popular_posts}>
          {popularPosts.map((post) => (
            <div key={post.id} className={styles.popular_post}>
              <div className={styles.post_image}>
                <img src={post.imageUrl} alt={post.title} />
              </div>
              <div className={styles.post_content}>
                <h4>
                  <Link to={`/Notices/${post.id}`}>{post.title}</Link>
                </h4>
                <p>{post.body?.substring(0, 60)}...</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorias */}
      <section className={styles.sidebar_section}>
        <h3>
          <CiGrid31 /> Categorias
        </h3>
        <div className={styles.categories}>
          <div className={styles.category_item}>
            <Link to="/categoria/noticias">Notícias</Link>
            <span className={styles.category_count}>24</span>
          </div>
          <div className={styles.category_item}>
            <Link to="/categoria/lancamentos">Lançamentos</Link>
            <span className={styles.category_count}>18</span>
          </div>
          <div className={styles.category_item}>
            <Link to="/categoria/reviews">Reviews</Link>
            <span className={styles.category_count}>15</span>
          </div>
          <div className={styles.category_item}>
            <Link to="/categoria/guias">Guias</Link>
            <span className={styles.category_count}>12</span>
          </div>
        </div>
      </section>

      {/* Top 8 Melhores Animes */}
      <section className={styles.sidebar_section}>
        <h3>
          <CiStar /> Top 8 Melhores Animes
        </h3>
        <div className={styles.top_animes}>
          {topAnimes.map((anime) => (
            <div key={anime.id} className={styles.anime_item}>
              <span className={styles.anime_rank}>#{anime.id}</span>
              <div className={styles.anime_info}>
                <h4>{anime.title}</h4>
                <div className={styles.anime_rating}>
                  <CiStar className={styles.rating_icon} />
                  <span>{anime.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Links Rápidos */}
      <section className={styles.sidebar_section}>
        <h3>
          <CiLink /> Links Rápidos
        </h3>
        <div className={styles.quick_links}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.quick_link}>
            <CiLink /> Facebook
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.quick_link}>
            <CiLink /> Twitter
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.quick_link}>
            <CiLink /> Instagram
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.quick_link}>
            <CiLink /> YouTube
          </a>
        </div>
      </section>
    </aside>
  );
};

export default Sidebar; 