const express = require("express");
const router = express.Router();
const ProjectModel = require("../models/projectModel");

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
