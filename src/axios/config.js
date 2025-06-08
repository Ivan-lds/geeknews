import axios from "axios";

const blogFetch = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true // Permite enviar cookies nas requisições
});

export default blogFetch;
