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
  const [image_url, setImageUrl] = useState(""); // Para URL da imagem
  const [image_url2, setImageUrl2] = useState(""); // Para URL da 2ª imagem
  const [video_url, setVideoUrl] = useState(""); // Para URL do vídeo
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");

  // Função para converter URL do YouTube para formato de embed
  const convertToEmbedUrl = (url) => {
    if (!url) return "";
    
    // Se já for uma URL de embed, retorna como está
    if (url.includes("youtube.com/embed")) return url;
    
    try {
      const urlObj = new URL(url);
      
      // Converte URLs do formato youtu.be
      if (urlObj.hostname === "youtu.be") {
        const videoId = urlObj.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Converte URLs do formato youtube.com/watch
      if (urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") {
        const videoId = urlObj.searchParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // Se não for uma URL do YouTube, retorna como está
      return url;
    } catch (error) {
      console.error("Erro ao converter URL do vídeo:", error);
      return url;
    }
  };

  // Função para carregar o post para edição
  const getPost = async () => {
    if (id) {
      try {
        const response = await blogFetch.get(`/Notices/${id}`);
        const data = response.data;

        setTitle(data.title);
        setBody(data.body);
        setImageUrl(data.image_url || "");
        setImageUrl2(data.image_url2 || "");
        // Converte a URL do vídeo para o formato de embed ao carregar
        setVideoUrl(convertToEmbedUrl(data.video_url) || "");
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
      image_url,
      image_url2,
      // Converte a URL do vídeo para o formato de embed ao salvar
      video_url: convertToEmbedUrl(video_url),
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
              <label htmlFor="image_url">URL da Imagem:</label>
              <input
                type="url"
                name="image_url"
                id="image_url"
                placeholder="Digite a URL da imagem"
                onChange={(e) => setImageUrl(e.target.value)}
                value={image_url}
              />
            </div>
            <div className="form-control">
              <label htmlFor="image_url2"></label>
              <input
                type="url"
                name="image_url2"
                id="image_url2"
                placeholder="URL da 2ª imagem"
                onChange={(e) => setImageUrl2(e.target.value)}
                value={image_url2}
              />
            </div>
            <div className="form-control">
              <label htmlFor="video_url">URL do Vídeo:</label>
              <input
                type="url"
                name="video_url"
                id="video_url"
                placeholder="Digite a URL do vídeo"
                onChange={(e) => setVideoUrl(e.target.value)}
                value={video_url}
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
