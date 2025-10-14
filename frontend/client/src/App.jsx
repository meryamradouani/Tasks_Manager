import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages de base
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Pages Admin
import AdminDashboard from './pages/Admin/Dashboard';
import ManageTasks from './pages/Admin/ManageTasks';
import CreateTask from './pages/Admin/CreateTask';
import ManageUsers from './pages/Admin/ManageUsers';
import EditTask from './pages/Admin/EditTask';

// Pages User
import UserDashboard from './pages/User/UserDashboard';
import ManageTask from './pages/User/ManageTask';
import ViewTaskDetails from './pages/User/ViewTaskDetails';

// Routes
import UserProvider from './context/UserProvider';
import PrivateRoute from './routes/PrivateRoute';

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="app-container">
          <main className="main-content">
            <Routes>
              {/* Routes publiques de base */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Routes protégées Admin */}
              <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="tasks" element={<ManageTasks />} />
                <Route path="create-task" element={<CreateTask />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="task/:id" element={<ViewTaskDetails />} />
                <Route path="edit-task/:id" element={<EditTask />} />
              </Route>

              {/* Routes protégées User */}
              <Route path="/user" element={<PrivateRoute allowedRoles={['user']} />}>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="mytask" element={<ManageTask />} />
                <Route path="task/:id" element={<ViewTaskDetails />} />
              </Route>

              {/* Route par défaut */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;