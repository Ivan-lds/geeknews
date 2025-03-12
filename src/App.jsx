import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useState } from "react";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Outlet /> {/* 🔹 Renderiza a rota filha (ex: Login) */}
    </div>
  );
};

export default App;
