import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/Auth.module.css";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Mostrar mensagem de sucesso se vier da página de registro
    useEffect(() => {
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao fazer login");
            }

            // Adicionar o campo username usando o nome do usuário
            const userData = {
                ...data.user,
                username: data.user.name // Usar o nome como username
            };

            // Salvar o usuário completo no localStorage
            localStorage.setItem("user", JSON.stringify(userData));
            console.log("Usuário salvo no localStorage:", userData);

            // Atualiza o estado de autenticação
            window.dispatchEvent(new Event("auth"));

            // Redireciona para a página inicial
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.auth_container}>
            <div className={styles.auth_card}>
                <div className={styles.auth_image} />
                <div className={styles.auth_content}>
                    <div className={styles.auth_header}>
                        <h1>Bem-vindo de volta!</h1>
                        <p>Entre com suas credenciais para acessar sua conta</p>
                    </div>

                    {success && (
                        <div className={styles.success_message}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.auth_form}>
                        <div className={styles.form_group}>
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label htmlFor="password">Senha</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                minLength={6}
                            />
                        </div>

                        {error && <p className={styles.error_message}>{error}</p>}

                        <div className={styles.auth_buttons}>
                            <button
                                type="submit"
                                className={styles.primary_button}
                                disabled={isLoading}
                            >
                                {isLoading ? "Entrando..." : "Entrar"}
                            </button>
                        </div>

                        <div className={styles.auth_links}>
                            <Link to="/esqueci-senha">Esqueceu sua senha?</Link>
                            <Link to="/cadastro">Criar uma conta</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 