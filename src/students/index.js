const express = require("express");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const { check, param, body, validationResult } = require("express-validator");
const uniqid = require("uniqid");

const router = express.Router();

const fileDirectory = path.join(__dirname, "students.json");
const projectsFileDirectory = path.join(
  __dirname,
  "../projects",
  "projects.json"
);
const readFile = (fileName) => {
  const buffer = fs.readFileSync(fileName);
  return JSON.parse(buffer.toString());
};
const uniqueEmail = (req, resp, next) => {
  const students = readFile(fileDirectory);
  const { email } = req.body;
  const { id } = req.params;
  if (
    students.filter((student) => student.email === email && student.id !== id)
      .length === 0
  ) {
    next();
  } else {
    console.log(
      students.filter((student) => (student.email = email && student.id !== id))
        .length
    );
    next("Bad request");
  }
};
const validateBody = () => {
  return [
    check("name").exists().withMessage("Name is required").not().isEmpty(),
    check("surname")
      .exists()
      .withMessage("Surname is required")
      .not()
      .isEmpty(),

    check("email").exists().withMessage("Email is required").isEmail(),
    check("birthDate")
      .exists()
      .withMessage("birthDate is required")
      .not()
      .isEmpty()
      .isDate(),
  ];
};

router
  .route("/")
  .get((req, resp, next) => {
    try {
      const students = readFile(fileDirectory);
      resp.send(students);
    } catch (e) {
      e.httpRequestStatusCode = 404;
      next(e);
    }
  })
  .post(validateBody(), uniqueEmail, (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const students = readFile(fileDirectory);
      const newStudent = { ...req.body, id: uniqid() };
      students.push(newStudent);
      fs.writeFileSync(fileDirectory, JSON.stringify(students));
      res.status(201).send(newStudent);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  });
router
  .route("/:id")
  .get((req, res, next) => {
    try {
      const param = req.params.id;
      const students = readFile(fileDirectory);
      const student = students.find((student) => student.id === param);
      res.send(student);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  })
  .put(validateBody(), uniqueEmail, (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const param = req.params.id;
      const students = readFile(fileDirectory);
      const updatedStudentsList = students.map(
        (student) =>
          (student.id === param && { ...req.body, id: param }) || student
      );
      fs.writeFileSync(fileDirectory, JSON.stringify(updatedStudentsList));
      res.send(updatedStudentsList);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  })
  .delete((req, res, next) => {
    try {
      const param = req.params.id;
      const students = readFile(fileDirectory);
      const filtered = students.filter((student) => student.id !== param);
      fs.writeFileSync(fileDirectory, JSON.stringify(filtered));
      res.send(filtered);
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  });
router.route("/:id/projects").get((req, res) => {
  const { id } = req.params;
  const projects = readFile(projectsFileDirectory);
  const numberOfProjects = projects.filter(
    (project) => project.studentID === id
  ).length;
  res.send(numberOfProjects.toString());
});

module.exports = router;
