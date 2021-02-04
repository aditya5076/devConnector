const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};

  //   checking from isEmpty module
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "email is invalid";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "email field is required";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = "password field is required";
  }

  if (!Validator.isLength(data.password, { min: 4, max: 30 })) {
    errors.password = "password must be atleast 4 chars long";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
