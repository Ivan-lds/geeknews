import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import blogFetch from "../axios/config";
import styles from "./Header.module.css";

const Header = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true);
        const response = await blogFetch.get("/Notices");
        const data = response.data;
        // Pegando os 5 posts mais recentes para o carrossel
        setFeaturedPosts(data.slice(0, 5));
      } catch (error) {
        console.error("Erro ao buscar posts em destaque:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  useEffect(() => {
    if (featuredPosts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredPosts.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
  };

  if (loading) {
    return <div className={styles.loading}>Carregando posts em destaque...</div>;
  }

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.featured_slider}>
        {featuredPosts.map((post, index) => (
          <div
            key={post.id}
            className={`${styles.slide} ${index === currentSlide ? styles.active : ""}`}
            style={{
              backgroundImage: post.imageUrl ? `url(${post.imageUrl})` : 'none',
            }}
          >
            <div className={styles.slide_content}>
              <h2>{post.title || 'Sem título'}</h2>
              <p>
                {post.body 
                  ? (post.body.length > 150 
                      ? post.body.substring(0, 150) + "..." 
                      : post.body)
                  : 'Sem conteúdo disponível'}
              </p>
              <Link to={`/Notices/${post.id}`} className={styles.read_more}>
                Ler mais
              </Link>
            </div>
          </div>
        ))}

        <button className={`${styles.slider_button} ${styles.prev}`} onClick={prevSlide}>
          <HiChevronLeft />
        </button>
        <button className={`${styles.slider_button} ${styles.next}`} onClick={nextSlide}>
          <HiChevronRight />
        </button>

        <div className={styles.slider_dots}>
          {featuredPosts.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.active : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
