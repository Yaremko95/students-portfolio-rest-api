const express = require("express");
const _ = require("lodash");
const StudentSchema = require("../models/studentSchema");
const ProjectModel = require("../models/projectModel");
const router = express.Router();
const q2m = require("query-to-mongo");

router
  .route("/")
  .get(async (req, resp, next) => {
    try {
      const { query } = req;
      const page = query.page;
      delete query.page;
      const queryToMongo = q2m(query);
      const criteria = queryToMongo.criteria;
      for (let key in criteria) {
        criteria[key] = { $regex: `${criteria[key]}`, $options: "i" };
      }
      console.log(criteria);
      const students = await StudentSchema.find(criteria)
        .skip(10 * page)
        .limit(10);
      const numOfStudents = await StudentSchema.count(criteria);
      resp.send({
        data: students,
        currentPage: page,
        pages: Math.ceil(numOfStudents / 10),
        results: numOfStudents,
      });
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
router.route("/:id/projects").get(async (req, res, next) => {
  try {
    let projects = await ProjectModel.findAllProjectsByStudentId(req.params.id);
    res.send(projects);
  } catch (e) {
    e.httpRequestStatusCode = 400;
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
