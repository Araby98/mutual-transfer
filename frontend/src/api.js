import axios from 'axios';

// Always point to Railway in all modules
const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL
});

export default api;
export { API_BASE_URL };
