const express = require("express");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const uniqid = require("uniqid");
const router = express.Router();

const fileDirectory = path.join(__dirname, "students.json");
router.get("/", (req, resp) => {
  const studentsList = fs.readFileSync(fileDirectory);
  resp.send(JSON.parse(studentsList.toString()));
});

router.get("/:id", (req, res) => {
  const query = req.params.id;
  const fileContent = fs.readFileSync(fileDirectory);
  const arr = JSON.parse(fileContent.toString());
  const user = arr.find((student) => student.id === query);
  res.send(user);
});
router.post("/", (req, res) => {
  const fileContent = fs.readFileSync(fileDirectory);
  const arr = JSON.parse(fileContent.toString());
  const user = req.body;
  if (!_.has(user, "name") || user.name === "") {
    res.status(400).send("name is required");
  } else if (!_.has(user, "surname") || user.surname === "") {
    res.status(400).send("surname is required");
  } else if (!_.has(user, "email") || user.email === "") {
    res.status(400).send("email is required");
  } else if (!_.has(user, "birthDate") || user.birthDate === "") {
    res.status(400).send("birthDate is required");
  } else if (arr.filter((student) => student.email === user.email).length > 0) {
    res.status(400).send("Email must be unique");
  } else {
    const newUser = { ...user, id: uniqid() };
    arr.push(newUser);
    fs.writeFileSync(fileDirectory, JSON.stringify(arr));
    res.status(201).send();
  }
});
router.put("/:id", (req, res) => {
  const query = req.params.id;
  const fileContent = fs.readFileSync(fileDirectory);
  const studentsList = JSON.parse(fileContent.toString());
  if (
    studentsList.filter(
      (student) => student.email === req.body.email && student.id !== query
    ).length > 0
  ) {
    res.status(400).send("Email must be unique");
  } else {
    const updatedStudentsList = studentsList.map(
      (student) =>
        (student.id === query && { ...req.body, id: query }) || student
    );

    fs.writeFileSync(fileDirectory, JSON.stringify(updatedStudentsList));
    res.send(updatedStudentsList);
  }
});
router.delete("/:id", (req, res) => {
  const query = req.params.id;
  const fileContent = fs.readFileSync(fileDirectory);
  const studentsList = JSON.parse(fileContent.toString());
  const filtered = studentsList.filter((student) => student.id !== query);
  fs.writeFileSync(fileDirectory, JSON.stringify(filtered));
  res.send(filtered);
});

module.exports = router;
