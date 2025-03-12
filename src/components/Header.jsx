import styles from "./Header.module.css";
import { useState, useEffect } from "react";
import blogFetch from "../axios/config";

const Header = () => {
  const [posts, setPosts] = useState([]);

  const getPosts = async () => {
    try {
      const response = await blogFetch.get("/Notices");

      const data = response.data;
      console.log(data);

      setPosts(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <header>
      <div className={styles.header_content}>
        {posts.length === 0 ? (
          <p>Carregando...</p>
        ) : (
          posts.map((post) => (
            <a
              href={`/Notices/${post.id}`}
              className={styles.post_container}
              key={post.id}
            >
              <img src={post.imageUrl} alt={post.title} />
              <div className={styles.post_content}>
                <h2>{post.title}</h2>
                <p>{post.body}</p>
              </div>
            </a>
          ))
        )}
      </div>
    </header>
  );
};

export default Header;
