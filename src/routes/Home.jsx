import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import blogFetch from "../axios/config";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import styles from "./Home.module.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPosts = async () => {
    try {
      setLoading(true);
      const response = await blogFetch.get("/Notices");
      const data = response.data;
      console.log("Posts recebidos:", data); // Log para debug
      setPosts(data.reverse());
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div className={styles.home}>
      <Header />
      <div className={styles.main_content}>
        <main className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Carregando posts...</div>
          ) : (
            <div className={styles.posts_grid}>
              {posts.map((post) => (
                <article key={post.id} className={styles.post_card}>
                  <Link to={`/Notices/${post.id}`}>
                    <div className={styles.post_image}>
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        onError={(e) => {
                          console.error("Erro ao carregar imagem:", e);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => console.log("Imagem carregada com sucesso:", post.image_url)}
                      />
                    </div>
                    <div className={styles.post_content}>
                      <h2>{post.title}</h2>
                      <p>{post.body?.substring(0, 150)}...</p>
                      <div className={styles.post_meta}>
                        <div className={styles.post_author}>
                          <span>{post.author || "Autor"}</span>
                        </div>
                        <time className={styles.post_date}>
                          {new Date(post.date).toLocaleDateString("pt-BR")}
                        </time>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </main>
        <Sidebar />
      </div>
    </div>
  );
};

export default Home;
