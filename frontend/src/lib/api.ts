import axios from 'axios';

// Create an axios instance with base URL and common headers
const API = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication service
export const authService = {
  login: async (credentials) => {
    const response = await API.post('/auth/login/', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await API.post('/auth/register/', userData);
    return response.data;
  },
  
  logout: async () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    try {
      const response = await API.get('/auth/user/');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};

// User service
export const userService = {
  updateProfile: async (profileData) => {
    const response = await API.patch('/users/me/', profileData);
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await API.post('/auth/password/change/', passwordData);
    return response.data;
  },
  
  changeEmail: async (emailData) => {
    const response = await API.patch('/users/me/', { email: emailData.email, password: emailData.password });
    return response.data;
  },
  
  updateNotificationPreferences: async (preferences) => {
    const response = await API.patch('/users/me/notification-preferences/', preferences);
    return response.data;
  },
  
  deleteAccount: async () => {
    const response = await API.delete('/users/me/');
    return response.data;
  },
};

// Course service
export const courseService = {
  getAllCourses: async (params) => {
    const response = await API.get('/courses/', { params });
    return response.data;
  },
  
  getCourse: async (id) => {
    const response = await API.get(`/courses/${id}/`);
    return response.data;
  },
  
  createCourse: async (courseData) => {
    const response = await API.post('/courses/', courseData);
    return response.data;
  },
  
  updateCourse: async (id, courseData) => {
    const response = await API.put(`/courses/${id}/`, courseData);
    return response.data;
  },
  
  deleteCourse: async (id) => {
    const response = await API.delete(`/courses/${id}/`);
    return response.data;
  },
  
  getInstructorCourses: async () => {
    const response = await API.get('/courses/instructor/');
    return response.data;
  },
};

// Lesson service
export const lessonService = {
  getLessons: async (courseId) => {
    const response = await API.get(`/courses/${courseId}/lessons/`);
    return response.data;
  },
  
  getLesson: async (courseId, lessonId) => {
    const response = await API.get(`/courses/${courseId}/lessons/${lessonId}/`);
    return response.data;
  },
  
  createLesson: async (courseId, lessonData) => {
    const response = await API.post(`/courses/${courseId}/lessons/`, lessonData);
    return response.data;
  },
  
  updateLesson: async (courseId, lessonId, lessonData) => {
    const response = await API.put(`/courses/${courseId}/lessons/${lessonId}/`, lessonData);
    return response.data;
  },
  
  deleteLesson: async (courseId, lessonId) => {
    const response = await API.delete(`/courses/${courseId}/lessons/${lessonId}/`);
    return response.data;
  },
};

// Enrollment service
export const enrollmentService = {
  getEnrollments: async () => {
    const response = await API.get('/enrollments/');
    return response.data;
  },
  
  enrollInCourse: async (courseId) => {
    const response = await API.post('/enrollments/', { course_id: courseId });
    return response.data;
  },
  
  checkEnrollment: async (courseId) => {
    try {
      const response = await API.get(`/enrollments/check/${courseId}/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { is_enrolled: false };
      }
      throw error;
    }
  },
  
  updateProgress: async (enrollmentId, progressData) => {
    const response = await API.patch(`/enrollments/${enrollmentId}/progress/`, progressData);
    return response.data;
  },
  
  unenroll: async (enrollmentId) => {
    const response = await API.delete(`/enrollments/${enrollmentId}/`);
    return response.data;
  },
};

// Reviews service
export const reviewService = {
  getReviews: async (courseId) => {
    const response = await API.get(`/courses/${courseId}/reviews/`);
    return response.data;
  },
  
  createReview: async (courseId, reviewData) => {
    const response = await API.post(`/courses/${courseId}/reviews/`, reviewData);
    return response.data;
  },
  
  updateReview: async (courseId, reviewId, reviewData) => {
    const response = await API.put(`/courses/${courseId}/reviews/${reviewId}/`, reviewData);
    return response.data;
  },
  
  deleteReview: async (courseId, reviewId) => {
    const response = await API.delete(`/courses/${courseId}/reviews/${reviewId}/`);
    return response.data;
  },
};

export default API;