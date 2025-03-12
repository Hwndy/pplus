import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ThemeProvider from './components/theme/ThemeProvider';

// Auth Pages
import Login from './pages/auth/StyledLogin';
import Register from './pages/auth/Register';
// import ForgotPassword from './pages/auth/ForgotPassword';
// import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import AnalystDashboard from './pages/analyst/AnalystDashboard';
import UserDashboard from './pages/user/UserDashboard';

const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                    {/* Protected Routes */}
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/supervisor/*"
                        element={
                            <ProtectedRoute allowedRoles={['supervisor']}>
                                <SupervisorDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/analyst/*"
                        element={
                            <ProtectedRoute allowedRoles={['analyst']}>
                                <AnalystDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute allowedRoles={['user', 'admin', 'supervisor', 'analyst']}>
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default Routes */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;