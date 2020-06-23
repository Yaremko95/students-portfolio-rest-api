const express = require("express");
const routes = require("./students");
const cors = require("cors");

const server = express();
server.use(cors());
server.use(express.json());
server.use("/students", routes);

server.listen(3000, () => {
  console.log("running");
});
