const express = require("express");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const { check, body, validationResult } = require("express-validator");
const router = express.Router();
const ProjectModel = require("../models/projectModel");

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
      .not()
      .isEmpty()
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
  .get(async (request, response, next) => {
    try {
      const { query } = request;
      for (let key in query) {
        query[key] = { $regex: `${query[key]}`, $options: "i" };
      }
      console.log(query);
      const projects = await ProjectModel.find(query).populate("studentID");

      response.status(200).send({ data: projects });
    } catch (e) {
      e.httpRequestStatusCode = 404;
      next(e);
    }
  })
  .post(async (request, response, next) => {
    try {
      const newProject = await new ProjectModel(request.body);
      const { _id } = await newProject.save();
      response.status(200).send(_id);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  });

router
  .route("/:id")
  .get(async (request, response, next) => {
    try {
      const project = await ProjectModel.findById(request.params.id);
      response.status(200).send(project);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  })
  .put(async (request, response, next) => {
    try {
      const { _id } = await ProjectModel.findByIdAndUpdate(
        request.params.id,
        request.body
      );
      response.status(200).send(_id);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  })
  .delete(async (request, response, next) => {
    try {
      const result = await ProjectModel.findByIdAndDelete(request.params.id);
      response.status(200).send(result);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  });

module.exports = router;
