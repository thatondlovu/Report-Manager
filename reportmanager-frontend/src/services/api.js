import axios from 'axios';


const API_BASE_URL = 'http://localhost:8090/api';

export const authService = {
    register: async (userData) => {
        const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
        return response.data;
    },
    login: async (credentials) => {
        const response = await axios.post(`${API_BASE_URL}/users/login`, credentials);
        return response.data;
    }
};

export const reportService = {
    saveReport: async (reportData) => {
        const response = await axios.post(`${API_BASE_URL}/reports`, reportData);
        return response.data;
    },
    getReportsByUser: async (userId) => {
        const response = await axios.get(`${API_BASE_URL}/reports/user/${userId}`);
        return response.data;
    },
    getReportById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/reports/${id}`);
        return response.data;
    }
};