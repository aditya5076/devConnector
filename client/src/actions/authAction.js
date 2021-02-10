import jwt_decode from "jwt-decode";
import { ERROR_DISPATCH, SET_CURRENT_USER } from "./types";
import setAuthTokenToHeader from "../utils/setAuthTokenToHeader";
import axios from "axios";

// register user
export const registerUser = (newUserData, history) => (dispatch) => {
  axios
    .post("/api/users/register", newUserData)
    .then((res) => history.push("/login"))
    .catch((err) =>
      dispatch({
        type: ERROR_DISPATCH,
        payload: err.response.data,
      })
    );
};

// login user with jwttoken
export const loginUser = (userData) => (dispatch) => {
  axios
    .post("/api/users/login", userData)
    .then((res) => {
      // get token from api
      const { token } = res.data;
      //   set to localstorage
      localStorage.setItem("jwtToken", token);
      //   set token to auth headers
      setAuthTokenToHeader(token);
      //   decode the token
      const decoded = jwt_decode(token);
      //   set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch((err) =>
      dispatch({
        type: ERROR_DISPATCH,
        payload: err.response.data,
      })
    );
};

export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};
