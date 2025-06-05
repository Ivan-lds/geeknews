import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useState } from "react";
import styles from "./App.module.css";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className={styles.app}>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
