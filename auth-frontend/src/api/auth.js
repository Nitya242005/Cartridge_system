import axios from 'axios';

import axios from 'axios';
const BASE_URL = 'https://cartridge-system-2.onrender.com/api/'; // ✅ Include trailing slash
axios.post(`${BASE_URL}register/`, data); // ✅ becomes ".../api/register/"



export const registerUser = (data) => axios.post(`${BASE_URL}/register/`, data);
export const loginUser = (data) => axios.post(`${BASE_URL}/login/`, data);

// ✅ Add this for JWT login
export const getToken = (data) => axios.post(`${BASE_URL}/token/`, data);
