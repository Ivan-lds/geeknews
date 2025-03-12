import { createServer } from "json-server";
import jsonServer from "json-server";

const server = createServer();
const router = jsonServer.router();

server.use(router);
server.listen(3000, () => {
  console.log("JSON Server is running");
});

export default server;
