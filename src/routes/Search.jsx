import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import blogFetch from "../axios/config";
import styles from "./Search.module.css";
import { Link } from "react-router-dom";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q"); // Obtendo o termo da URL
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await blogFetch.get("/Notices");
        const data = response.data;
        setPosts(data);
        setFilteredPosts([]); // Inicia a lista de posts filtrados vazia
      } catch (error) {
        console.log(error);
      }
    };

    getPosts();
  }, []);

  useEffect(() => {
    if (query !== "") {
      const result = posts.filter((post) =>
        post.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPosts(result); // Filtra os posts com base no termo de pesquisa
    } else {
      setFilteredPosts([]); // Se o campo de pesquisa estiver vazio, não exibe nada
    }
  }, [query, posts]);

  return (
    <>
      {/* Exibindo os posts apenas se houver pesquisa */}
      <section
        className={styles.posts}
        style={{ display: filteredPosts.length > 0 ? "block" : "none" }}
      >
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div className={styles.post} key={post.id}>
              <img 
                src={post.image_url} 
                alt={post.title}
                onError={(e) => {
                  console.error("Erro ao carregar imagem:", e);
                  e.target.style.display = 'none';
                }}
                onLoad={() => console.log("Imagem carregada com sucesso:", post.image_url)}
              />
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
        ) : (
          <></> // Não exibe nada se não houver posts filtrados
        )}
      </section>
    </>
  );
};

export default Search;
