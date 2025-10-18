import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2 } from "lucide-react";
import Turnstile from "react-turnstile";
import { useTranslation } from "../utils/translations";
import { useApp } from "../context/AppContext";
import { getContactSchema } from "../utils/validationSchemas";
import api from "../services/api";

const ContactUs = () => {
  const { language } = useApp();
  const t = useTranslation(language);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef([]);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState(false);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [formValidated, setFormValidated] = useState(false);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // React Hook Form with Yup validation
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    trigger,
    getValues
  } = useForm({
    resolver: yupResolver(getContactSchema(language)),
    mode: "onChange" // Real-time validation
  });

  // Disable scrolling when modal is open
  useEffect(() => {
    if (showSuccessModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSuccessModal]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observers = [];

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleSections((prev) => new Set([...prev, index]));
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  // Validate form before showing Turnstile
  const validateForm = async () => {
    const { toast } = await import('react-toastify');

    // Trigger validation for all fields
    const isValid = await trigger();

    if (!isValid) {
      toast.error(language === 'ar'
        ? 'يرجى تصحيح الأخطاء في النموذج'
        : 'Please correct the errors in the form', {
        autoClose: 3000
      });
      return;
    }

    // Validation passed
    setFormValidated(true);
    toast.success(language === 'ar'
      ? 'تم التحقق من النموذج بنجاح! يرجى إكمال التحقق الأمني.'
      : 'Form validated successfully! Please complete security verification.', {
      autoClose: 3000
    });

    // Scroll to Turnstile section
    setTimeout(() => {
      document.getElementById('contact-turnstile-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const onSubmit = async (formData) => {
    // Validate Turnstile
    if (!turnstileToken) {
      const { toast } = await import('react-toastify');
      toast.error(language === 'ar' ? 'يرجى إكمال التحقق من الأمان' : 'Please complete the security verification');
      return;
    }

    setIsSubmitting(true);

    try {
      // Import toast dynamically
      const { toast } = await import('react-toastify');

      // Submit using API service (with automatic retry)
      await api.contact.send({ ...formData, turnstileToken });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Show modal after a brief delay to allow scroll to complete
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 300);

      // Reset form and Turnstile token
      reset();
      setTurnstileToken('');
      setFormValidated(false);

      toast.success(language === 'ar'
        ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'
        : 'Your message has been sent successfully! We will contact you soon.', {
        autoClose: 5000
      });
    } catch (error) {
      const { toast } = await import('react-toastify');
      toast.error(language === 'ar'
        ? `خطأ في الاتصال: ${error.message}`
        : `Connection error: ${error.message}`, {
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div
          ref={addToRefs}
          className={`text-center mb-12 transition-all duration-1000 ${
            visibleSections.has(0) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            {t("contactUs")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("contactDescription")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div
            ref={addToRefs}
            className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-1000 ${
              visibleSections.has(1) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
            }`}
          >
            <h2 className="text-2xl font-bold text-blue-800 mb-6">
              {t("sendMessage")}
            </h2>

            <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("fullName")} *
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    disabled={formValidated}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t("enterName")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("email")} *
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    disabled={formValidated}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t("enterEmail")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("phone")} *
                  </label>
                  <input
                    type="tel"
                    {...register("phone")}
                    disabled={formValidated}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t("enterPhone")}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("subject")} *
                  </label>
                  <input
                    type="text"
                    {...register("subject")}
                    disabled={formValidated}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t("enterSubject")}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("message")} *
                </label>
                <textarea
                  {...register("message")}
                  rows="6"
                  disabled={formValidated}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t("enterMessage")}
                ></textarea>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              {/* Step 1: Validate Form Button (shown before validation) */}
              {!formValidated && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                      {language === 'ar'
                        ? 'انقر على "التحقق من النموذج" للمتابعة'
                        : 'Click "Validate Form" to continue'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={validateForm}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg text-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {language === 'ar' ? 'التحقق من النموذج والمتابعة' : 'Validate Form & Continue'}
                  </button>
                </div>
              )}

              {/* Step 2 & 3: Cloudflare Turnstile and Submit (shown after validation) */}
              {formValidated && (
                <div id="contact-turnstile-section" className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      {language === 'ar'
                        ? 'تم التحقق من النموذج بنجاح! '
                        : 'Form validated successfully! '}
                      <button
                        type="button"
                        onClick={() => {
                          setFormValidated(false);
                          setTurnstileToken('');
                          setTurnstileError(false);
                        }}
                        className="text-green-900 underline hover:text-green-700 font-medium"
                      >
                        {language === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                    </p>
                  </div>

                  {/* Cloudflare Turnstile */}
                  {turnstileSiteKey && (
                    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {language === 'ar' ? 'التحقق الأمني *' : 'Security Verification *'}
                      </label>
                      {turnstileError ? (
                        <div className="text-center">
                          <p className="text-red-600 mb-3 text-sm">
                            {language === 'ar'
                              ? 'حدث خطأ في التحقق. انقر للمحاولة مرة أخرى.'
                              : 'Verification error. Click to try again.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setTurnstileError(false);
                              setTurnstileKey(prev => prev + 1);
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                          >
                            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                          </button>
                        </div>
                      ) : (
                        <Turnstile
                          key={turnstileKey}
                          sitekey={turnstileSiteKey}
                          onVerify={(token) => {
                            setTurnstileToken(token);
                            setTurnstileError(false);
                          }}
                          onError={() => {
                            setTurnstileToken('');
                            setTurnstileError(true);
                          }}
                          onExpire={() => {
                            setTurnstileToken('');
                          }}
                          theme="light"
                          language={language === 'ar' ? 'ar' : 'en'}
                        />
                      )}
                      {turnstileToken && !turnstileError && (
                        <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          {language === 'ar' ? 'تم التحقق' : 'Verified'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submit Button (shown after Turnstile verification OR if no Turnstile configured) */}
                  {(!turnstileSiteKey || turnstileToken) && (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 active:scale-95"
                      } text-white`}
                    >
                      {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                      {isSubmitting ? t("sending") : t("sendMessage")}
                    </button>
                  )}
                </div>
              )}
            </form>

            {/* Social Media Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <h3 className="font-semibold text-gray-800 mb-4">{t("followUs")}</h3>
              <div className="flex justify-center space-x-6">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/fakhama.rental/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 cursor-pointer transition-all duration-300 shadow-lg hover:scale-125 hover:rotate-12 animate-bounce-slow"
                  style={{ animationDelay: '0ms' }}
                >
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a
                  href="https://wa.me/962777769776"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 cursor-pointer transition-all duration-300 shadow-lg hover:scale-125 hover:rotate-12 animate-bounce-slow"
                  style={{ animationDelay: '200ms' }}
                >
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/fakhama.rental?igsh=MTdidnpkZmdyZXNzbQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-500 hover:to-pink-400 cursor-pointer transition-all duration-300 shadow-lg hover:scale-125 hover:rotate-12 animate-bounce-slow"
                  style={{ animationDelay: '400ms' }}
                >
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Company Info */}
            <div
              ref={addToRefs}
              className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-1000 ${
                visibleSections.has(2) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
              }`}
            >
              <h2 className="text-2xl font-bold text-blue-800 mb-6">
                {t("contactInfo")}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{t("address")}</h3>
                    <p className="text-gray-600">{t("companyAddress")}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{t("phone")}</h3>
                    <p className="text-gray-600">{t("companyPhone")}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{t("email")}</h3>
                    <p className="text-gray-600">{t("companyEmail")}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{t("workingHours")}</h3>
                    <p className="text-gray-600">{t("companyHours")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div
              ref={addToRefs}
              className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-1000 ${
                visibleSections.has(3) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {t("findUs")}
              </h2>
              <div className="rounded-lg overflow-hidden h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3384.2785234567!2d35.8641415!3d32.0215589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151c9fac7a77b7a3%3A0xdfa1bca30b302baa!2sAlfakhama%20rent%20a%20car!5e0!3m2!1sen!2s!4v1696000000000!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t("findUs")}
                ></iframe>
              </div>
              <div className="mt-4">
                <a
                  href="https://google.com/maps/place/Alfakhama+rent+a+car/@32.0215589,35.8641415,17z/data=!4m6!3m5!1s0x151c9fac7a77b7a3:0xdfa1bca30b302baa!8m2!3d32.0214404!4d35.8659795!16s%2Fg%2F11sr7q76fd?entry=ttu&g_ep=EgoyMDI1MDkyNC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t("viewOnMaps")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-fade-in" style={{
            position: 'relative',
            margin: 'auto'
          }}>
            <div className="p-8 text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t("messageSent")}
              </h3>

              {/* Message */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                {t("contactSuccess")}
              </p>

              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUs;