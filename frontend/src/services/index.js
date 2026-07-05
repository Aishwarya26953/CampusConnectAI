import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingUsers: (role) => api.get('/admin/pending-users', { params: { role } }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
  // Analytics
  getAttendanceByDept: () => api.get('/admin/analytics/attendance-by-department'),
  getComplaintsByCategory: () => api.get('/admin/analytics/complaints-by-category'),
  getComplaintsByStatus: () => api.get('/admin/analytics/complaints-by-status'),
  getEventsByStatus: () => api.get('/admin/analytics/events-by-status'),
  getUsersByDept: () => api.get('/admin/analytics/users-by-department'),
  getMonthlyRegistrations: () => api.get('/admin/analytics/monthly-registrations'),
};

export const departmentService = {
  list: () => api.get('/departments/'),
  create: (data) => api.post('/departments/', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  get: (id) => api.get(`/departments/${id}`),
};

export const classroomService = {
  list: (params) => api.get('/classrooms/', { params }),
  create: (data) => api.post('/classrooms/', data),
  update: (id, data) => api.put(`/classrooms/${id}`, data),
  delete: (id) => api.delete(`/classrooms/${id}`),
  get: (id) => api.get(`/classrooms/${id}`),
  recommend: (params) => api.get('/classrooms/recommend', { params }),
};

export const timetableService = {
  list: (params) => api.get('/timetables/', { params }),
  create: (data) => api.post('/timetables/', data),
  update: (id, data) => api.put(`/timetables/${id}`, data),
  delete: (id) => api.delete(`/timetables/${id}`),
};

export const attendanceService = {
  mark: (data) => api.post('/attendance/mark', data),

  update: (id, data) => api.put(`/attendance/${id}`, data),

  getMyAttendance: (params) =>
    api.get('/attendance/my-attendance', { params }),

  // Automatically use the logged-in student's ID
  getSummary: (params) => {
    const user = JSON.parse(localStorage.getItem("user"));
    return api.get(`/attendance/summary/${user.id}`, { params });
  },

  getByTimetable: (ttId, params) =>
    api.get(`/attendance/by-timetable/${ttId}`, { params }),

  getAllSummaries: () =>
    api.get('/attendance/all-summaries'),
};

export const eventService = {
  list: (params) => api.get('/events/', { params }),
  create: (data) => api.post('/events/', data),
  get: (id) => api.get(`/events/${id}`),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  updateStatus: (id, status) => api.put(`/events/${id}/status`, null, { params: { status } }),
  register: (id) => api.post(`/events/${id}/register`),
  unregister: (id) => api.delete(`/events/${id}/unregister`),
};

export const complaintService = {
  list: (params) => api.get('/complaints/', { params }),
  create: (data) => api.post('/complaints/', data),
  get: (id) => api.get(`/complaints/${id}`),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
  myComplaints: () => api.get('/complaints/my-complaints'),
};

export const announcementService = {
  list: (params) => api.get('/announcements/', { params }),
  create: (data) => api.post('/announcements/', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const notificationService = {
  list: (params) => api.get('/notifications/', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const aiService = {
  chat: (message) => api.post('/ai/chat', { message }),
};
