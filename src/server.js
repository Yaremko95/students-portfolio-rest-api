const express = require("express");
const routes = require("./students");
const projectRoutes = require("./projects");
const cors = require("cors");

const server = express();
server.use(cors());
server.use(express.json());
server.use("/students", routes);

server.use("/projects", projectRoutes);

server.use((err, req, res, next) => {
  if (err.httpRequestStatusCode == 404) {
    res.status(404).send("Not Found");
  } else if (err.httpRequestStatusCode == 400) {
    res.status(404).send("Bad Request");
  } else {
    res.status(500).send("Internal Server Error");
  }
});

server.listen(3000, () => {
  console.log("running");
});
