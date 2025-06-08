import { useState } from "react";
import { useNavigate } from "react-router-dom";
import blogFetch from "../axios/config";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Função para realizar o login
  const handleLogin = async () => {
    try {
      const response = await blogFetch.post("/api/auth/login", {
        email,
        password
      });

      if (response.data.user) {
        // Salvar o usuário completo no localStorage
        const userData = {
          ...response.data.user,
          username: response.data.user.name // Usar o nome como username
        };
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("Usuário salvo no localStorage:", userData);

        // Limpar as chaves antigas para evitar conflitos
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("loggedUser");

        console.log("Usuário logado com sucesso:", userData);
        navigate("/"); // Redireciona para a página inicial após login
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError(error.response?.data?.message || "Erro ao fazer login");
    }
  };

  return (
    <div className="login-container">
      <div className="login">
        <h1>L O G I N</h1>
        {error && <p className="error-message">{error}</p>}
        <form>
          <div className="login-inputs">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <div className="login-inputs">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
            />
          </div>
        </form>

        <div className="login-buttons">
          <div className="login-btns-div">
            <button
              className="cadastro-btn"
              onClick={() => navigate("/cadastro")}
            >
              Cadastrar
            </button>
            <button
              className="esqueceu-senha"
              onClick={() => navigate("/esqueceu-senha")}
            >
              Esqueceu a senha ?
            </button>
          </div>
          <button className="login-btn" onClick={handleLogin}>
            Entrar
          </button>
        </div>
      </div>
      <img src="https://i.postimg.cc/wT8BN0mz/supera.png" alt="" />
    </div>
  );
};

export default Login;
