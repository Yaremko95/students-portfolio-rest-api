const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const v = require("validator");
const StudentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  birthDate: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});
StudentSchema.pre("save", async function (next) {
  const student = this;
  try {
    if (v.isEmail(student.email)) {
      let st = await StudentModel.findOne({ email: student.email });
      if (st) {
        throw new Error("Email already exists");
      } else {
        return next();
      }
    } else {
      throw new Error("Email is not valid");
    }
  } catch (e) {
    return next(e);
  }
});
const StudentModel = mongoose.model("Student", StudentSchema);
module.exports = StudentModel;
