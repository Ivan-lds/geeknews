import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import blogFetch from "../axios/config";

import "./Cadastro.css";

const Cadastro = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [Users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Buscar usuários do banco de dados
  const getUsers = async () => {
    try {
      const response = await blogFetch.get("/Users");
      setUsers(response.data);
    } catch (error) {
      console.log("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Função para cadastrar usuário
  const handleRegister = async () => {
    if (password !== passwordConfirm) {
      alert("As senhas não coincidem!");
      return;
    }

    // Verifica se o e-mail já existe
    const userExists = Users.some((user) => user.email === email);
    if (userExists) {
      alert("E-mail já cadastrado!");
      return;
    }

    // Criar um novo usuário
    const newUser = {
      name: username,
      email,
      password,
    };

    try {
      const response = await blogFetch.post("/api/auth/register", newUser);
      if (response.data) {
        alert("Cadastro realizado com sucesso!");
        navigate("/login"); // Redireciona para a tela de login
      }
    } catch (error) {
      console.log("Erro ao cadastrar usuário:", error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("Erro ao cadastrar usuário. Tente novamente.");
      }
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro">
        <h1>C A D A S T R O</h1>

        <form>
          <div className="cadastro-inputs">
            <label htmlFor="usuario">Nome do Usuário:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome do usuário"
            />
          </div>
          <div className="cadastro-inputs">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <div className="cadastro-inputs">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
            />
          </div>
          <div className="cadastro-inputs">
            <label htmlFor="password-confirm">Confirme a senha:</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirme a senha"
            />
          </div>
        </form>

        <div className="cadastro-buttons">
          <div className="cadastro-btns-div">
            <button className="cadastro-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button
              className="esqueceu-senha"
              onClick={() => navigate("/esqueceu-senha")}
            >
              Esqueceu a senha ?
            </button>
          </div>
          <button className="login-btn" onClick={handleRegister}>
            Cadastrar
          </button>
        </div>
      </div>
      <img src="https://i.postimg.cc/wT8BN0mz/supera.png" alt="supera" />
    </div>
  );
};

export default Cadastro;
