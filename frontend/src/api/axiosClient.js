import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const API_KEY = import.meta.env.VITE_API_KEY;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

export default axiosClient;