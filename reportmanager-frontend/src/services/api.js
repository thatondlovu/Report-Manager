import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api';

export const userService = {
  // POST /api/users/register
  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
    return response.data;
  },

  // POST /api/users/login
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/users/login`, credentials);
    return response.data;
  },

  // GET /api/users/{id}
  getUserById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },

  // PUT /api/users/{id}
  updateProfile: async (id, userData) => {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData);
    return response.data;
  },
};

export const reportService = {
  // POST /api/reports
  saveReport: async (reportData) => {
    const payload = {
      id: reportData.id || null,
      weekNumber: parseInt(reportData.weekNumber, 10),
      startDate: reportData.startDate,
      endDate: reportData.endDate,
      mondayText: reportData.mondayText || '',
      tuesdayText: reportData.tuesdayText || '',
      wednesdayText: reportData.wednesdayText || '',
      thursdayText: reportData.thursdayText || '',
      fridayText: reportData.fridayText || '',
      challenges: reportData.challenges || '',
      status: reportData.status ? reportData.status.toUpperCase() : 'DRAFT',
      userId: reportData.userId || reportData.user?.id,
    };
    const response = await axios.post(`${API_BASE_URL}/reports`, payload);
    return response.data;
  },

  // GET /api/reports/user/{userId}
  getReportsByUser: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/reports/user/${userId}`);
    return response.data;
  },

  // GET /api/reports/{id}
  getReportById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/reports/${id}`);
    return response.data;
  },

  deleteReport: async (reportId, userId) => {
    const response = await axios.delete(`${API_BASE_URL}/reports/${reportId}`, {
      params: { userId },
    });
    return response.data;
  },
};