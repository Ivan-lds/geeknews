import blogFetch from "../axios/config";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

const Home = () => {
  const [posts, setPosts] = useState([]);

  const getPosts = async () => {
    try {
      const response = await blogFetch.get("/Notices");
      const data = response.data;
      setPosts(data.reverse());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div className={styles.home}>
      <Header />
      <section className={styles.posts}>
        {posts.length === 0 ? (
          <p>Carregando...</p>
        ) : (
          posts.map((post) => (
            <div className={styles.post} key={post.id}>
              <img src={post.imageUrl} alt={post.title} />
              <section className={styles.post_info}>
                <div className={styles.post_content}>
                  <h2>{post.title}</h2>
                  <p>{post.body}</p>
                </div>
                <div className={styles.post_actions}>
                  <Link className={styles.btn} to={`/Notices/${post.id}`}>
                    Ler mais
                  </Link>
                </div>
              </section>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Home;
