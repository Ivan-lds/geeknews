import blogFetch from "../axios/config";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";

const Admin = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Função para pegar os posts
  const getPosts = async () => {
    try {
      const response = await blogFetch.get("/Notices");
      const data = response.data;
      setPosts(data);
    } catch (error) {
      console.log(error);
    }
  };

  // Função para excluir um post
  const deletePost = async (id) => {
    try {
      await blogFetch.delete(`/Notices/${id}`);
      const filteredPosts = posts.filter((post) => post.id !== id);
      setPosts(filteredPosts); // Atualiza a lista de posts após a exclusão
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPosts(); // Carrega os posts ao inicializar o componente
  }, []);

  // Função para filtrar posts pelo título com base no termo de busca
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin">
      <div className="admin-header">
        <h1>Gerenciar posts</h1>
        <input
          className="search-input"
          type="search"
          name="search"
          id="search"
          placeholder="Pesquisar..."
          value={searchTerm} // Acompanhar o valor do input
          onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o estado com o valor do input
        />
      </div>

      {filteredPosts.length === 0 ? (
        <p>Nenhum post encontrado.</p> // Mensagem quando nenhum post é encontrado após a busca
      ) : (
        filteredPosts.map((post) => (
          <div className="post-gerenciar" key={post.id}>
            <h2>{post.title}</h2>
            <div className="actions">
              <Link className="btn edit-btn" to={`/Notices/edit/${post.id}`}>
                Editar
              </Link>
              <button
                className="btn delete-btn"
                onClick={() => deletePost(post.id)} // Exclui o post
              >
                Excluir
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Admin;
