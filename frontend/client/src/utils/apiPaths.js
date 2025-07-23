// apiPaths.js
export const API_BASE_URL = "http://localhost:3000";

const apiPaths = {
  // ==================== AUTHENTIFICATION ====================
  auth: {
    login: `/api/auth/login`,
    register: `/api/auth/register`,
    logout: `/api/auth/logout`,
    get_profile: `/api/auth/profile`,
    upload_image: `/api/auth/upload-image`,
    forgot_password: `/api/auth/forgot-password`,
    reset_password: `/api/auth/reset-password`,
  },

  // ==================== UTILISATEURS ====================
  users: {
    get_all_users: `/api/users`,
    get_user_by_id: (userId) => `/api/users/${userId}`,
    create_user: `/api/users`,
    update_user: (userId) => `/api/users/${userId}`,
    delete_user: (userId) => `/api/users/${userId}`,
  },

  // ==================== TÂCHES ====================
  tasks: {
    get_dashboard_data: `/api/tasks/dashboard-data`,
    get_user_dashboard_data: `/api/tasks/user-dashboard-data`,
    get_all_tasks: `/api/tasks`,
    get_task_by_id: (taskId) => `/api/tasks/${taskId}`,
    create_task: `/api/tasks`,
    update_task: (taskId) => `/api/tasks/${taskId}`,
    delete_task: (taskId) => `/api/tasks/${taskId}`,
    update_task_status: (taskId) => `/api/tasks/${taskId}/status`,
    update_todo_checklist: (taskId) => `/api/tasks/${taskId}/todo`,
  },

  // ==================== RAPPORTS ====================
  reports: {
    export_tasks: `/api/reports/export/tasks`,
    export_users: `/api/reports/export/users`,
    export_my_tasks: `/api/reports/export/my-tasks`,
  },

  //
  image:{
    upload_image:"/api/auth/upload-image",
  }
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export const QUERY_KEYS = {
  AUTH: 'auth',
  USERS: 'users',
  TASKS: 'tasks',
  REPORTS: 'reports',
};

export default apiPaths;