import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status, response.data);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response && error.response.status, error.response && error.response.data || error.message);
        return Promise.reject(error);
    }
);

export default instance;