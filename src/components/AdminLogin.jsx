import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.admin.login(formData);

      if (data.success) {
        // Store token in sessionStorage (clears when browser closes)
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminUser', JSON.stringify(data.user));

        toast.success(`Welcome ${data.user.full_name || data.user.username}!`);

        // Redirect to admin page
        navigate('/admin');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Al-Fakhama</h1>
          <p className="text-blue-200">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Back to Website Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-200 hover:text-white transition-colors text-sm"
          >
            ← Back to Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
