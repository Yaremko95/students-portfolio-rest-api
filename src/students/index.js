const express = require("express");
const _ = require("lodash");
const StudentSchema = require("../models/studentSchema");
const ProjectModel = require("../models/projectModel");
const router = express.Router();
const q2m = require("query-to-mongo");
const db = require("../db");
const students = require("./students.json");

router
  .route("/")
  .get(async (req, resp, next) => {
    // try {
    //   const { query } = req;
    //   const page = query.page;
    //   delete query.page;
    //   const queryToMongo = q2m(query);
    //   const criteria = queryToMongo.criteria;
    //   for (let key in criteria) {
    //     criteria[key] = { $regex: `${criteria[key]}`, $options: "i" };
    //   }
    //   console.log(criteria);
    //   const students = await StudentSchema.find(criteria)
    //     .skip(10 * page)
    //     .limit(10);
    //   const numOfStudents = await StudentSchema.countDocuments(criteria);
    //   resp.send({
    //     data: students,
    //     currentPage: page,
    //     pages: Math.ceil(numOfStudents / 10),
    //     results: numOfStudents,
    //   });
    // } catch (e) {
    //   console.log(e);
    //   e.httpRequestStatusCode = 404;
    //   next(e);
    // }

    const { query } = req;

    const page = query.page;
    delete query.page;
    let querySql = 'SELECT * FROM "Students"';
    let params = [];
    for (let key in query) {
      params.push(query[key]);

      if (params.length === 1)
        querySql += ` WHERE ${key} ILIKE '%${query[key]}%' `;
      else querySql += ` AND ${key} ILIKE $${query[key]} `;
    }
    console.log(querySql);
    const response = await db.query(querySql);
    const numOfStudents = await db.query('SELECT count(*) FROM "Students"');

    resp.send({
      data: response.rows,
      currentPage: page,
      pages: Math.ceil(parseInt(numOfStudents.rows[0].count) / 10),
      results: parseInt(numOfStudents.rows[0].count),
    });
  })
  .post(async (req, res, next) => {
    // try {
    //   const newStudent = await StudentSchema(req.body);
    //   const { _id } = await newStudent.save();
    //   res.send(_id);
    // } catch (e) {
    //   e.httpRequestStatusCode = 500;
    //   next(e);
    // }
    console.log(req.body);
    const response = await db.query(
      `INSERT INTO "Students" ( name, surname, email, "dateOfBirth") 
                                     Values ($1, $2, $3, $4)
                                     RETURNING *`,
      [req.body.name, req.body.surname, req.body.email, req.body.birthDate]
    );

    console.log(response);
    res.send(response.rows[0]);
  });
router
  .route("/:id")
  .get(async (req, res, next) => {
    // try {
    //   const student = await StudentSchema.findById(req.params.id);
    //   res.send(student);
    // } catch (e) {
    //   e.httpRequestStatusCode = 500;
    //   next(e);
    // }

    let response = await db.query(`SELECT * FROM "Students" WHERE _id=$1`, [
      req.params.id,
    ]);
    console.log(response.rows);
    res.status(200).send(response.rows[0]);
  })
  .put(async (req, res, next) => {
    // try {
    //   const { _id } = await StudentSchema.findByIdAndUpdate(
    //     req.params.id,
    //     req.body
    //   );
    //   res.send(_id);
    // } catch (e) {
    //   e.httpRequestStatusCode = 500;
    //   next(e);
    // }
    console.log(req.body);
    const params = [];
    let query = `UPDATE "Students" SET `;
    for (let key in req.body) {
      query +=
        (params.length > 0 ? ", " : "") +
        '"' +
        key +
        '"' +
        " = $" +
        (params.length + 1);
      params.push(req.body[key]);
    }
    params.push(req.params.id);
    query += " WHERE _id = $" + params.length + " RETURNING *";
    console.log(query);
    const response = await db.query(query, params);
    if (response.rowCount === 0) return res.status(404).send("Not Found");
    res.send(response.rows[0]);
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
