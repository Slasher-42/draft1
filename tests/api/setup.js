const axios = require("axios");

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

const getAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

const registerUser = async (name, email, password, role) => {
  return api.post("/auth/register", { name, email, password, role });
};

const loginUser = async (email, password) => {
  return api.post("/auth/login", { email, password });
};

const uniqueEmail = (prefix = "user") => {
  return `${prefix}_${Date.now()}@test.com`;
};

module.exports = {
  api,
  getAuthHeader,
  registerUser,
  loginUser,
  uniqueEmail,
};
