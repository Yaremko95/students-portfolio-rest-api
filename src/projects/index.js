const express = require("express");
const router = express.Router();
const ProjectModel = require("../models/projectModel");
const q2m = require("query-to-mongo");
router
  .route("/")
  .get(async (request, response, next) => {
    try {
      const { query } = request;
      const page = query.page;
      delete query.page;
      const queryToMongo = q2m(query);
      const criteria = queryToMongo.criteria;
      for (let key in criteria) {
        criteria[key] = { $regex: `${criteria[key]}`, $options: "i" };
      }
      console.log(query);
      const projects = await ProjectModel.find(criteria)
        .populate("studentID")
        .skip(10 * page)
        .limit(10);
      const numOfProjects = await ProjectModel.count(criteria);

      response.status(200).send({
        data: projects,
        currentPage: page,
        pages: Math.ceil(numOfProjects / 10),
        results: numOfProjects,
      });
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
