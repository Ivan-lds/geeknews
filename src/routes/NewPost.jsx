import blogFetch from "../axios/config";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./NewPost.css";

const NewPost = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtém o ID do post na URL
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [body2, setBody2] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Para URL da imagem
  const [imageUrl2, setImageUrl2] = useState(""); // Para URL da 2ª imagem
  const [videoUrl, setVideoUrl] = useState(""); // Para URL do vídeo
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");

  // Função para carregar o post para edição
  const getPost = async () => {
    if (id) {
      try {
        const response = await blogFetch.get(`/Notices/${id}`);
        const data = response.data;

        setTitle(data.title);
        setBody(data.body);
        setImageUrl(data.imageUrl || ""); // Se existir a URL da imagem
        setImageUrl2(data.imageUrl2 || "");
        setVideoUrl(data.videoUrl || ""); // Se existir a URL do vídeo
        setAuthor(data.author);
        setDate(data.date);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Função para criar ou editar o post
  const savePost = async (e) => {
    e.preventDefault();

    const post = {
      title,
      body,
      body2,
      imageUrl,
      imageUrl2,
      videoUrl,
      author,
      date,
      userId: 1,
    };

    if (id) {
      // Se houver ID, significa que é uma edição
      await blogFetch.put(`/Notices/${id}`, post);
    } else {
      // Caso contrário, é um novo post
      await blogFetch.post("/Notices", post);
    }

    navigate("/"); // Após salvar, redireciona para a lista de posts
  };

  useEffect(() => {
    getPost(); // Chama a função para pegar o post ao carregar o componente, caso seja uma edição
  }, [id]);

  return (
    <div className="new-post">
      <h2>{id ? "Editando: " + title : "Inserir novo Post:"}</h2>
      <form onSubmit={savePost}>
        <section className="form-container">
          <section className="form-content">
            <div className="form-control">
              <label htmlFor="title">Título:</label>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Digite o título"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
              />
            </div>
            <div className="form-control">
              <label htmlFor="imageUrl">URL da Imagem:</label>
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                placeholder="Digite a URL da imagem"
                onChange={(e) => setImageUrl(e.target.value)}
                value={imageUrl}
              />
            </div>
            <div className="form-control">
              <label htmlFor="imageUrl2"></label>
              <input
                type="url"
                name="imageUrl_2"
                id="imageUrl_2"
                placeholder="URL da 2ª imagem"
                onChange={(e) => setImageUrl2(e.target.value)}
                value={imageUrl2}
              />
            </div>
            <div className="form-control">
              <label htmlFor="videoUrl">URL do Vídeo:</label>
              <input
                type="url"
                name="videoUrl"
                id="videoUrl"
                placeholder="Digite a URL do vídeo"
                onChange={(e) => setVideoUrl(e.target.value)}
                value={videoUrl}
              />
            </div>
            <div className="form-control">
              <label htmlFor="author">Autor:</label>
              <input
                type="text"
                name="author"
                id="author"
                placeholder="Digite o nome do autor"
                onChange={(e) => setAuthor(e.target.value)}
                value={author}
              />
            </div>
            <div className="form-control">
              <label htmlFor="date">Data:</label>
              <input
                type="date"
                name="date"
                id="date"
                placeholder="Digite a data"
                onChange={(e) => setDate(e.target.value)}
                value={date}
              />
            </div>

            <input
              type="submit"
              value={id ? "Salvar Alterações" : "Criar Post"}
              className={`btn ${id ? "btn-salvar-alteracoes" : ""}`}
            />
          </section>

          <section className="form-bodys">
            <div className="form-control">
              <label htmlFor="body">Conteúdo:</label>
              <textarea
                name="body"
                id="body"
                placeholder="Digite o conteúdo..."
                onChange={(e) => setBody(e.target.value)}
                value={body}
              ></textarea>
            </div>

            <div className="form-control">
              <label htmlFor="body_2">Conteúdo pt.2:</label>
              <textarea
                name="body_2"
                id="body_2"
                placeholder="Digite 2º parte conteúdo..."
                onChange={(e) => setBody2(e.target.value)}
                value={body2}
              ></textarea>
            </div>
          </section>
        </section>
      </form>
    </div>
  );
};

export default NewPost;
