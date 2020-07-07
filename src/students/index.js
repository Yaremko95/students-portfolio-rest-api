const express = require("express");
const _ = require("lodash");
const StudentSchema = require("../models/studentSchema");
const router = express.Router();

router
  .route("/")
  .get(async (req, resp, next) => {
    try {
      const { query } = req;

      for (let key in query) {
        query[key] = { $regex: `${query[key]}`, $options: "i" };
      }
      console.log(query);
      const students = await StudentSchema.find(query);
      resp.send(students);
    } catch (e) {
      e.httpRequestStatusCode = 404;
      next(e);
    }
  })
  .post(async (req, res, next) => {
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
router.route("/checkEmail").post(async (req, res, next) => {
  try {
    let student = await StudentSchema.findOne({
      email: req.body.email,
      _id: { $not: { $eq: req.body._id } },
    });
    if (student) {
      console.log(student);
      throw new Error();
    } else {
      res.status(200).send("ok");
    }
  } catch (e) {
    e.httpRequestStatusCode = 400;
    next(e);
  }
});

module.exports = router;
