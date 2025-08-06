import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

export const registerUser = (data) => axios.post(`${BASE_URL}/register/`, data);
export const loginUser = (data) => axios.post(`${BASE_URL}/login/`, data);

// ✅ Add this for JWT login
export const getToken = (data) => axios.post(`${BASE_URL}/token/`, data);

