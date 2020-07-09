const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const v = require("validator");
const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  studentID: {
    type: Schema.Types.ObjectID,
    ref: "Student",
  },
  repoURL: {
    type: String,
    required: true,
    validate: {
      validator: (url) => {
        if (!v.isURL(url)) {
          throw new Error("url: not valid");
        }
      },
    },
  },

  liveURL: {
    type: String,
    required: true,
    validate: {
      validator: (url) => {
        if (!v.isURL(url)) {
          throw new Error("url: not valid");
        }
      },
    },
  },
});

const ProjectModel = model("Project", ProjectSchema);

module.exports = ProjectModel;
