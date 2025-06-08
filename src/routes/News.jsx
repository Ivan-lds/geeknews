import blogFetch from "../axios/config";
import { CiCalendar } from "react-icons/ci";
import { CiEdit } from "react-icons/ci";
import { FaThumbsUp, FaThumbsDown, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./News.module.css";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // Pegar o usuário do localStorage
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  console.log("Usuário do localStorage:", loggedUser);

  useEffect(() => {
    const getPost = async () => {
      try {
        const response = await blogFetch.get(`/Notices/${id}`);
        console.log("Dados do post recebidos:", response.data);
        console.log("URL da imagem:", response.data.image_url);
        console.log("URL da segunda imagem:", response.data.image_url2);
        console.log("URL do vídeo:", response.data.video_url);
        setPost(response.data);

        // Buscar comentários incluindo as reações do usuário logado
        const commentsResponse = await blogFetch.get(`/Comments/${id}${loggedUser ? `?user=${loggedUser.username}` : ''}`);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error("Erro ao buscar post:", error);
      }
    };
    getPost();
  }, [id, loggedUser]);

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return "";
    
    // Converter o timestamp do SQLite para UTC
    const [datePart, timePart] = timestamp.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    
    // Criar a data em UTC
    const commentDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    const now = new Date();
    
    console.log('Debug tempo:', {
      timestamp,
      datePart,
      timePart,
      commentDateUTC: commentDate.toISOString(),
      nowUTC: now.toISOString(),
      commentDateLocal: commentDate.toString(),
      nowLocal: now.toString(),
      diffMs: now - commentDate,
      diffSeconds: Math.floor((now - commentDate) / 1000)
    });

    // Garantir que estamos trabalhando com datas válidas
    if (isNaN(commentDate.getTime())) {
      console.error('Data inválida:', timestamp);
      return "data inválida";
    }

    const differenceInSeconds = Math.floor((now - commentDate) / 1000);

    // Se a diferença for muito pequena (menos de 1 segundo)
    if (differenceInSeconds < 1) {
      return "agora mesmo";
    }

    // Se a data do comentário for no futuro
    if (differenceInSeconds < 0) {
      console.warn('Data no futuro detectada:', {
        timestamp,
        now: now.toISOString(),
        commentDate: commentDate.toISOString(),
        diffSeconds: differenceInSeconds
      });
      return "agora mesmo";
    }

    if (differenceInSeconds < 60) {
      return `${differenceInSeconds} ${differenceInSeconds === 1 ? 'segundo' : 'segundos'} atrás`;
    } else if (differenceInSeconds < 3600) {
      const minutes = Math.floor(differenceInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (differenceInSeconds < 86400) {
      const hours = Math.floor(differenceInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    } else if (differenceInSeconds < 2592000) {
      const days = Math.floor(differenceInSeconds / 86400);
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    } else if (differenceInSeconds < 31536000) {
      const months = Math.floor(differenceInSeconds / 2592000);
      return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
    } else {
      const years = Math.floor(differenceInSeconds / 31536000);
      return `${years} ${years === 1 ? 'ano' : 'anos'} atrás`;
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (newComment.trim()) {
      try {
        const newCommentData = {
          postId: id,
          text: newComment,
          user: loggedUser ? loggedUser.username : "Anônimo"
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

  const handleReaction = async (commentId, reactionType) => {
    if (!loggedUser) {
      alert("Você precisa estar logado para reagir aos comentários");
      return;
    }

    if (!loggedUser.username) {
      console.error("Usuário logado não tem username:", loggedUser);
      alert("Erro ao identificar usuário. Por favor, faça login novamente.");
      return;
    }

    try {
      console.log('Enviando reação:', { 
        commentId, 
        user: loggedUser.username, 
        reactionType,
        loggedUser 
      });

      const response = await blogFetch.post(`/Comments/${commentId}/reactions`, {
        user: loggedUser.username,
        reactionType
      });

      console.log('Resposta da reação:', response.data);

      // Atualizar o comentário na lista
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId ? response.data : comment
        )
      );
    } catch (error) {
      console.error("Erro ao processar reação:", error);
      console.error("Detalhes do erro:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.details || error.response.data?.error || "Você precisa estar logado para reagir aos comentários";
        alert(errorMessage);
      } else {
        alert("Erro ao processar sua reação. Tente novamente.");
      }
    }
  };

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

  const handleDeleteComment = async (commentId) => {
    if (!loggedUser || loggedUser.role !== 'admin') return;

    if (window.confirm('Tem certeza que deseja apagar este comentário?')) {
      try {
        await blogFetch.delete(`/Comments/${commentId}`, {
          data: { user: loggedUser }
        });
        setComments(comments.filter(comment => comment.id !== commentId));
      } catch (error) {
        console.error('Erro ao apagar comentário:', error);
        alert('Erro ao apagar comentário');
      }
    }
  };

  return (
    <div className={styles.post_container}>
      {!post ? (
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
              {(Array.isArray(comments) ? comments : []).map((comment) => {
                console.log("Renderizando comentário:", comment);
                console.log("Usuário atual:", loggedUser);
                console.log("É admin?", loggedUser?.role === 'admin');
                
                return (
                  <div key={comment.id} className={styles.commentItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <p>
                          <strong>{comment.user}:</strong>
                        </p>
                        <p>{comment.comment}</p>
                        <p className={styles.timeElapsed}>
                          {getTimeElapsed(comment.created_at)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className={styles.commentReactions}>
                          <button
                            className={`${styles.reactionButton} ${comment.user_reaction === 'like' ? styles.active : ''}`}
                            onClick={() => handleReaction(comment.id, 'like')}
                            disabled={!loggedUser}
                            title={!loggedUser ? 'Faça login para reagir' : 'Curtir'}
                          >
                            <FaThumbsUp /> {comment.likes || 0}
                          </button>
                          <button
                            className={`${styles.reactionButton} ${comment.user_reaction === 'dislike' ? styles.active : ''}`}
                            onClick={() => handleReaction(comment.id, 'dislike')}
                            disabled={!loggedUser}
                            title={!loggedUser ? 'Faça login para reagir' : 'Não curtir'}
                          >
                            <FaThumbsDown /> {comment.dislikes || 0}
                          </button>
                        </div>
                        {loggedUser && loggedUser.role === 'admin' && (
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDeleteComment(comment.id)}
                            title="Apagar comentário"
                            style={{ 
                              marginLeft: 'auto', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              background: 'none',
                              border: 'none',
                              color: '#ff4444',
                              padding: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <FaTrash style={{ fontSize: '1.2rem' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
