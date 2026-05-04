import api from "../../services/api";

/**
 * ✅ Register (Signup) API
 * POST http://localhost:5001/api/auth/register
 */
export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response;
};

export const loginUserApi = async (data) => {
  const response = await api.post("/auth/login", data);
  return response;
};
``