const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const fileDirectory = path.join(__dirname, "projects.json");

const readFile = (fileName) => {
  const buffer = fs.readFileSync(fileName);
  return JSON.parse(buffer.toString());
};

router.get("/", (request, response, next) => {
  try {
    const projects = readFile(fileDirectory);
    response.send(projects);
  } catch (e) {
    e.httpRequestStatusCode = 404;
    next(e);
  }
});

router.get("/:id", (request, response, next) => {
  try {
    const param = request.params.id;
    const projects = readFile(fileDirectory);
    const project = projects.find((project) => project.id === param);
    response.send(project);
  } catch (e) {
    e.httpRequestStatusCode = 500;
    next(e);
  }
});

router.post("/", (request, response, next) => {
  try {
    const projects = readFile(fileDirectory);
    const project = projects.find((project) => project.id === param);
  } catch (e) {
    e.httpRequestStatusCode = 500;
    next(e);
  }
});
router.put("/:id", (request, response, next) => {});

router.delete("/:id", (request, response, next) => {});

module.exports = router;
