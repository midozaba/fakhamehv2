import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { LogOut, User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { language, user, logout } = useApp();
  const t = useTranslation(language);

  const handleLogout = () => {
    logout();
    toast.success(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
    navigate('/login');
  };

  return (
    <div className={`${language === 'ar' ? 'rtl' : 'ltr'} min-h-screen bg-gradient-to-br from-blue-50 to-slate-100`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </h1>
              <p className="text-blue-200 mt-1">
                {language === 'ar' ? 'مرحباً' : 'Welcome'}, {user?.full_name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg transition-all"
            >
              <LogOut size={20} />
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {language === 'ar' ? 'معلومات المستخدم' : 'User Information'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <User className="text-blue-900" size={24} />
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                </p>
                <p className="font-semibold text-gray-800">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <User className="text-blue-900" size={24} />
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </p>
                <p className="font-semibold text-gray-800">{user?.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Mail className="text-blue-900" size={24} />
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </p>
                <p className="font-semibold text-gray-800">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Phone className="text-blue-900" size={24} />
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الهاتف' : 'Phone'}
                </p>
                <p className="font-semibold text-gray-800">{user?.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-900 to-slate-600 text-white rounded-lg">
              <Shield className="text-white" size={24} />
              <div>
                <p className="text-sm text-blue-200">
                  {language === 'ar' ? 'الدور' : 'Role'}
                </p>
                <p className="font-semibold uppercase">{user?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-900" size={24} />
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'معرف المستخدم' : 'User ID'}
                </p>
                <p className="font-semibold text-gray-800">#{user?.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-blue-900 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {language === 'ar' ? 'الحجوزات' : 'Bookings'}
            </h3>
            <p className="text-gray-600 text-sm">
              {language === 'ar' ? 'عرض وإدارة الحجوزات' : 'View and manage bookings'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-blue-900 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {language === 'ar' ? 'السيارات' : 'Cars'}
            </h3>
            <p className="text-gray-600 text-sm">
              {language === 'ar' ? 'إدارة أسطول السيارات' : 'Manage car fleet'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-blue-900 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {language === 'ar' ? 'العملاء' : 'Customers'}
            </h3>
            <p className="text-gray-600 text-sm">
              {language === 'ar' ? 'إدارة بيانات العملاء' : 'Manage customer data'}
            </p>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-900 to-slate-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105"
          >
            {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
