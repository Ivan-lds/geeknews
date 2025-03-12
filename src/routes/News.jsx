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
        setPost(response.data);

        const commentsResponse = await blogFetch.get(`/Comments/${id}`);
        setComments(commentsResponse.data);
      } catch (error) {
        console.log(error);
      }
    };
    getPost();
  }, [id]);

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const getTimeElapsed = (timestamp) => {
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
          user: loggedUser || "Anônimo", // Nome do usuário logado ou "Anônimo" por padrão
          createDate: new Date().toISOString(),
        };
        await blogFetch.post("/Comments", newCommentData);
        setComments((prevComments) =>
          Array.isArray(prevComments)
            ? [...prevComments, newCommentData]
            : [newCommentData]
        );

        setNewComment("");
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await blogFetch.get("/Comments");
        setComments(response.data || []); // Se os dados forem indefinidos, define como array vazio
      } catch (error) {
        console.error("Erro ao buscar comentários:", error);
        setComments([]); // Evita problemas caso a API falhe
      }
    };

    fetchComments();
  }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
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
          <img src={post.imageUrl} alt={post.title} />
          <div
            className={styles.post_body}
            dangerouslySetInnerHTML={{ __html: formatBody(post.body) }}
          />
          <div
            style={{
              display: !post.imageUrl2 && !post.videoUrl ? "none" : "block",
            }}
          >
            {post.imageUrl2 && <img src={post.imageUrl2} alt={post.title} />}
            {post.videoUrl && (
              <iframe
                width="560"
                height="315"
                src={post.videoUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
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
                (comment, index) => (
                  <div key={index} className={styles.commentItem}>
                    <p>
                      <strong>{comment.user}:</strong>{" "}
                      {/* Exibindo o username */}
                    </p>
                    <p>{comment.text}</p>
                    <p className={styles.timeElapsed}>
                      {getTimeElapsed(comment.createDate)}
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
