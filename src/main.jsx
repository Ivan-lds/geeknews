import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";

import App from "./App";
import Home from "./routes/Home";
import News from "./routes/News";
import NewPost from "./routes/NewPost";
import Admin from "./routes/Admin";
import Login from "./routes/Login";
import Cadastro from "./routes/Cadastro";
import Animes from "./routes/Animes";
import Personagens from "./routes/Personagens";

import "./index.css";
import Search from "./routes/Search";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "cadastro",
        element: <Cadastro />,
      },
      {
        path: "",
        element: <Home />,
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
