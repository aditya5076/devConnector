const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  //   checking from isEmpty module
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirmPassword = !isEmpty(data.confirmPassword)
    ? data.confirmPassword
    : "";

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "name must be between 2 and 30 chars";
  }
  if (Validator.isEmpty(data.name)) {
    errors.name = "name field is required";
  }
  if (!Validator.isEmail(data.email)) {
    errors.email = "email is invalid";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "email field is required";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = "password field is required";
  }
  if (Validator.isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "confirmPassword field is required";
  }
  if (!Validator.isLength(data.password, { min: 4, max: 30 })) {
    errors.password = "password must be atleast 4 chars long";
  }
  if (!Validator.equals(data.password, data.confirmPassword)) {
    errors.name = "password is not matching";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
