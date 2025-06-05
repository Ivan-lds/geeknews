import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Auth.module.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao processar a solicitação");
            }

            setSuccess("Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.");
            setEmail("");
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
                        <h1>Esqueceu sua senha?</h1>
                        <p>Digite seu e-mail para receber as instruções de recuperação</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.auth_form}>
                        <div className={styles.form_group}>
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
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
                                {isLoading ? "Enviando..." : "Enviar instruções"}
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