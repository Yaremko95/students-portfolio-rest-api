const express = require("express");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const { check, param, body, validationResult } = require("express-validator");
const uniqid = require("uniqid");
const StudentSchema = require("../models/studentSchema");

const router = express.Router();

// const fileDirectory = path.join(__dirname, "students.json");
// const projectsFileDirectory = path.join(
//   __dirname,
//   "../projects",
//   "projects.json"
// );
// const readFile = (fileName) => {
//   const buffer = fs.readFileSync(fileName);
//   return JSON.parse(buffer.toString());
// };
const uniqueEmail = async (req, resp, next) => {
  let student = await StudentSchema.findOne({ email: req.body.email });
  if (student) {
    const error = new Error();
    error.httpRequestStatusCode = 400;
    next(error);
  } else {
    console.log("ok");
    next();
  }
};

router
  .route("/")
  .get(async (req, resp, next) => {
    try {
      const students = await StudentSchema.find(req.query);
      resp.send(students);
    } catch (e) {
      e.httpRequestStatusCode = 404;
      next(e);
    }
  })
  .post(uniqueEmail, async (req, res, next) => {
    try {
      const newStudent = await StudentSchema(req.body);
      const { _id } = await newStudent.save();
      res.send(_id);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  });
router
  .route("/:id")
  .get(async (req, res, next) => {
    try {
      const student = await StudentSchema.findById(req.params.id);
      res.send(student);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  })
  .put(async (req, res, next) => {
    try {
      const { _id } = await StudentSchema.findByIdAndUpdate(
        req.params.id,
        req.body
      );
      res.send(_id);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const result = await StudentSchema.findByIdAndDelete(req.params.id);
      res.send(result);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  });
// router.route("/:id/projects").get((req, res) => {
//   const { id } = req.params;
//   const projects = readFile(projectsFileDirectory);
//   const numberOfProjects = projects.filter(
//     (project) => project.studentID === id
//   ).length;
//   res.send(numberOfProjects.toString());
// });

module.exports = router;
