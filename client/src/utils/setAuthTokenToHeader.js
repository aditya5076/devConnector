import axios from "axios";

const setAuthTokenToHeader = (token) => {
  if (token) {
    // apply to every request
    axios.defaults.headers.common["Authorizaton"] = token;
  } else {
    // remove token
    delete axios.defaults.headers.common["Authorizaton"];
  }
};

export default setAuthTokenToHeader;
