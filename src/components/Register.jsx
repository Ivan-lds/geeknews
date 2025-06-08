import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Auth.module.css";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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

        // Validações
        if (formData.password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao criar conta");
            }

            // Redireciona para a página de login com mensagem de sucesso
            navigate("/login", { 
                state: { message: "Conta criada com sucesso! Faça login para continuar." }
            });
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
                        <h1>Criar Conta</h1>
                        <p>Preencha os dados abaixo para criar sua conta</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.auth_form}>
                        <div className={styles.form_group}>
                            <label htmlFor="name">Nome</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Seu nome completo"
                                required
                                autoComplete="name"
                            />
                        </div>

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
                                autoComplete="new-password"
                                minLength={6}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label htmlFor="confirmPassword">Confirmar Senha</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
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
                                {isLoading ? "Criando conta..." : "Criar conta"}
                            </button>
                        </div>

                        <div className={styles.auth_links}>
                            <span>Já tem uma conta?</span>
                            <Link to="/login">Fazer login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 