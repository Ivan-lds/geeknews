import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "../styles/Auth.module.css";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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
        setSuccess("");

        if (!token) {
            setError("Token de redefinição de senha inválido");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        if (formData.password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao redefinir a senha");
            }

            setSuccess("Senha redefinida com sucesso!");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className={styles.auth_container}>
                <div className={styles.auth_card}>
                    <div className={styles.auth_content}>
                        <div className={styles.auth_header}>
                            <h1>Link Inválido</h1>
                            <p>O link de redefinição de senha é inválido ou expirou.</p>
                        </div>
                        <div className={styles.auth_buttons}>
                            <Link to="/esqueci-senha" className={styles.primary_button}>
                                Solicitar novo link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.auth_container}>
            <div className={styles.auth_card}>
                <div className={styles.auth_image} />
                <div className={styles.auth_content}>
                    <div className={styles.auth_header}>
                        <h1>Redefinir Senha</h1>
                        <p>Digite sua nova senha</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.auth_form}>
                        <div className={styles.form_group}>
                            <label htmlFor="password">Nova Senha</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && <p className={styles.error_message}>{error}</p>}
                        {success && <p className={styles.success_message}>{success}</p>}

                        <div className={styles.auth_buttons}>
                            <button
                                type="submit"
                                className={styles.primary_button}
                                disabled={isLoading}
                            >
                                {isLoading ? "Redefinindo..." : "Redefinir senha"}
                            </button>
                        </div>

                        <div className={styles.auth_links}>
                            <Link to="/login">Voltar para o login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 