import axios from 'axios';

const BASE_URL = 'https://cartridge-system-2.onrender.com/api/'; // ✅ Trailing slash is correct

// Register a new user
export const registerUser = (data) => axios.post(`${BASE_URL}register/`, data);

// Login user
export const loginUser = (data) => axios.post(`${BASE_URL}login/`, data);

// JWT token login (returns access and refresh tokens)
export const getToken = (data) => axios.post(`${BASE_URL}token/`, data);
