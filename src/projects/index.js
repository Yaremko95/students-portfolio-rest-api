const express = require("express");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const { check, body, validationResult } = require("express-validator");
const router = express.Router();

const fileDirectory = path.join(__dirname, "projects.json");
const studentsFileDirectory = path.join(
  __dirname,
  "../students",
  "students.json"
);
const readFile = (fileName) => {
  const buffer = fs.readFileSync(fileName);
  return JSON.parse(buffer.toString());
};
const validateBody = () => {
  return [
    check("name")
      .exists()
      .withMessage("all fields are required")
      .not()
      .isEmpty()
      .withMessage("Can't be Empty"),
    check("description")
      .exists()
      .withMessage("all fields are required")
      .not()
      .isEmpty()
      .withMessage("Can't be Empty"),
    check("studentID")
      .exists()
      .withMessage("all fields are required")
      // .not()
      // .isEmpty()
      .withMessage("Can't be Empty")
      .custom((id) => {
        const students = readFile(studentsFileDirectory);

        if (students.filter((student) => student.id === id).length === 0) {
          throw new Error("student doesn't exist");
        }
        return true;
      }),
    check("repoURL")
      .exists()
      .withMessage("all fields are required")
      .not()
      .isEmpty()
      .isURL(),
    check("liveURL")
      .exists()
      .withMessage("all fields are required")
      .not()
      .isEmpty()
      .isURL(),
  ];
};
router
  .route("/")
  .get((request, response, next) => {
    try {
      console.log(studentsFileDirectory);
      const projects = readFile(fileDirectory);
      response.send(projects);
    } catch (e) {
      e.httpRequestStatusCode = 404;
      next(e);
    }
  })
  .post(validateBody(), (request, response, next) => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
      }
      const projects = readFile(fileDirectory);
      const newProject = {
        ...request.body,
        id: uniqid(),
        createdAt: new Date(),
      };
      projects.push(newProject);
      fs.writeFileSync(fileDirectory, JSON.stringify(projects));
      response.status(201).send();
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  });
router
  .route("/:id")
  .get((request, response, next) => {
    try {
      const param = request.params.id;
      const projects = readFile(fileDirectory);
      const project = projects.find((project) => project.id === param);
      response.send(project);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  })
  .put(validateBody(), (request, response, next) => {
    try {
      const param = request.params.id;
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
      }
      const projects = readFile(fileDirectory);

      const updatedProjects = projects.map(
        (project) =>
          (project.id === param && { ...request.body, id: param }) || project
      );
      fs.writeFileSync(fileDirectory, JSON.stringify(updatedProjects));
      response.status(201).send(updatedProjects);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  })
  .delete((request, response, next) => {
    try {
      const param = request.params.id;

      const projects = readFile(fileDirectory);
      const filtered = projects.filter((project) => project.id !== param);
      fs.writeFileSync(fileDirectory, JSON.stringify(filtered));
      response.status(201).send(filtered);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  });

module.exports = router;
