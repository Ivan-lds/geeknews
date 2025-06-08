import blogFetch from "../axios/config";
import { CiCalendar } from "react-icons/ci";
import { CiEdit } from "react-icons/ci";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./News.module.css";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  // Simulei um exemplo onde o nome do usuário está armazenado no localStorage
  const loggedUser = localStorage.getItem("loggedUser"); // Nome do usuário logado

  useEffect(() => {
    const getPost = async () => {
      try {
        const response = await blogFetch.get(`/Notices/${id}`);
        console.log("Dados do post recebidos:", response.data);
        console.log("URL da imagem:", response.data.image_url);
        console.log("URL da segunda imagem:", response.data.image_url2);
        console.log("URL do vídeo:", response.data.video_url);
        setPost(response.data);

        const commentsResponse = await blogFetch.get(`/Comments/${id}`);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error("Erro ao buscar post:", error);
      }
    };
    getPost();
  }, [id]);

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const commentDate = new Date(timestamp);
    const differenceInSeconds = Math.floor((now - commentDate) / 1000);

    if (differenceInSeconds < 60) {
      return `${differenceInSeconds} segundos atrás`;
    } else if (differenceInSeconds < 3600) {
      const minutes = Math.floor(differenceInSeconds / 60);
      return `${minutes} minutos atrás`;
    } else if (differenceInSeconds < 86400) {
      const hours = Math.floor(differenceInSeconds / 3600);
      return `${hours} horas atrás`;
    } else if (differenceInSeconds < 2592000) {
      const days = Math.floor(differenceInSeconds / 86400);
      return `${days} dias atrás`;
    } else if (differenceInSeconds < 31536000) {
      const months = Math.floor(differenceInSeconds / 2592000);
      return `${months} meses atrás`;
    } else {
      const years = Math.floor(differenceInSeconds / 31536000);
      return `${years} anos atrás`;
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (newComment.trim()) {
      try {
        const newCommentData = {
          postId: id,
          text: newComment,
          user: loggedUser || "Anônimo"
        };

        console.log("Enviando comentário:", newCommentData);
        const response = await blogFetch.post("/Comments", newCommentData);
        console.log("Resposta do servidor:", response.data);
        
        const savedComment = response.data;

        setComments((prevComments) => {
          const updatedComments = Array.isArray(prevComments) ? [...prevComments] : [];
          updatedComments.unshift(savedComment);
          return updatedComments;
        });

        setNewComment("");
      } catch (error) {
        console.error("Erro ao enviar comentário:", error);
        console.error("Detalhes do erro:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        alert("Erro ao enviar comentário. Tente novamente.");
      }
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await blogFetch.get(`/Comments/${id}`);
        setComments(response.data || []);
      } catch (error) {
        console.error("Erro ao buscar comentários:", error);
        setComments([]);
      }
    };

    fetchComments();
  }, [id]);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return isoDate;
    }
  };

  const formatBody = (body) => {
    if (!body) return "";
    return body
      .split("\n")
      .map((line) => `<p>${line}</p><br>`)
      .join("");
  };

  return (
    <div className={styles.post_container}>
      {!post.title ? (
        <p>Carregando...</p>
      ) : (
        <div className={styles.post_content}>
          <section className={styles.post_header}>
            <h2>{post.title}</h2>
            <div className={styles.post_info}>
              <CiEdit />
              <p className={styles.author}>{post.author}</p>
              <CiCalendar />
              <p className={styles.date}>{formatDate(post.date)}</p>
            </div>
          </section>
          {post.image_url && (
            <div style={{ margin: '20px 0' }}>
              <img 
                src={post.image_url} 
                alt={post.title} 
                onError={(e) => {
                  console.error("Erro ao carregar imagem:", e);
                  e.target.style.display = 'none';
                }}
                onLoad={() => console.log("Imagem carregada com sucesso")}
              />
            </div>
          )}
          <div
            className={styles.post_body}
            dangerouslySetInnerHTML={{ __html: formatBody(post.body) }}
          />
          <div
            style={{
              display: !post.image_url2 && !post.video_url ? "none" : "block",
            }}
          >
            {post.image_url2 && (
              <div style={{ margin: '20px 0' }}>
                <img 
                  src={post.image_url2} 
                  alt={post.title} 
                  onError={(e) => {
                    console.error("Erro ao carregar segunda imagem:", e);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => console.log("Segunda imagem carregada com sucesso")}
                />
              </div>
            )}
            {post.video_url && (
              <div style={{ margin: '20px 0' }}>
                <iframe
                  width="560"
                  height="315"
                  src={post.video_url}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  onError={(e) => {
                    console.error("Erro ao carregar vídeo:", e);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => console.log("Vídeo carregado com sucesso:", post.video_url)}
                ></iframe>
              </div>
            )}
          </div>

          <div
            className={styles.post_body}
            dangerouslySetInnerHTML={{ __html: formatBody(post.body2) }}
          />
          <div className={styles.comments}>
            <div className={styles.commentForm}>
              <h3>COMENTÁRIOS</h3>
              <textarea
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Deixe seu comentário"
              ></textarea>
              <button onClick={handleCommentSubmit}>Comentar</button>
            </div>

            <div className={styles.commentList}>
              {(Array.isArray(comments) ? comments : []).map(
                (comment) => (
                  <div key={comment.id} className={styles.commentItem}>
                    <p>
                      <strong>{comment.user}:</strong>
                    </p>
                    <p>{comment.comment}</p>
                    <p className={styles.timeElapsed}>
                      {getTimeElapsed(comment.created_at)}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
