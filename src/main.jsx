import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Home from "./routes/Home";
import News from "./routes/News";
import NewPost from "./routes/NewPost";
import Admin from "./routes/Admin";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Animes from "./routes/Animes";
import Personagens from "./routes/Personagens";
import Search from "./routes/Search";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "cadastro",
        element: <Register />,
      },
      {
        path: "esqueci-senha",
        element: <ForgotPassword />,
      },
      {
        path: "redefinir-senha",
        element: <ResetPassword />,
      },
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "new",
        element: <NewPost />,
      },
      {
        path: "animes",
        element: <Animes />,
      },
      {
        path: "personagens",
        element: <Personagens />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
      {
        path: "Notices/:id",
        element: <News />,
      },
      {
        path: "Notices/edit/:id",
        element: <NewPost />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
