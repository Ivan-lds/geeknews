import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import blogFetch from "../axios/config";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Controle do login
  const navigate = useNavigate();

  // Função para buscar usuários
  const getUsers = async () => {
    try {
      const response = await blogFetch.get("/Users");
      const data = response.data;
      setUsers(data);
    } catch (error) {
      console.log("Erro ao buscar usuários:", error);
    }
  };

  // Função para realizar o login
  const handleLogin = () => {
    // Busca o usuário no banco de dados simulado
    const user_found = Users.find(
      (user) => user.email === email && user.password === password
    );

    if (user_found) {
      // Armazena informações no localStorage
      localStorage.setItem("userEmail", user_found.email);
      localStorage.setItem(
        "isAdmin",
        user_found.role === "admin" ? "true" : "false"
      );
      localStorage.setItem("userRole", user_found.role);
      localStorage.setItem("loggedUser", user_found.username); // Salva o nome do usuário logado

      console.log("Usuário logado com sucesso:", user_found.email);
      setIsLoggedIn(true); // Atualiza o estado de login
      navigate("/"); // Redireciona para a página inicial após login
    } else {
      console.log("Credenciais inválidas");
      navigate("/"); // Redireciona para a página inicial após login
    }
  };

  // Verificação de login ao carregar a página
  useEffect(() => {
    if (isLoggedIn) return; // Se já fez login, não faz mais nada
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      console.log("Usuário já está logado:", userEmail);
    } else {
      console.log("Usuário não está logado");
      getUsers(); // Carrega os usuários ao não estar logado
    }
  }, [isLoggedIn, navigate]); // Agora verifica apenas após o login ser realizado

  return (
    <div className="login-container">
      <div className="login">
        <h1>L O G I N</h1>
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
