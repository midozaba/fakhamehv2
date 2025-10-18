import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Shield, Clock, Award, Users, Star, CheckCircle, Zap, Heart } from 'lucide-react';
import Turnstile from "react-turnstile";
import { useTranslation } from '../utils/translations';
import { useApp } from '../context/AppContext';
import { getCarImage } from '../utils/carHelpers';
import { getErrorMessage, isNetworkError } from '../utils/apiHelpers';
import { CarCardSkeletonGrid } from './common/CarCardSkeleton';
import ErrorMessage from './common/ErrorMessage';
import SEO from './common/SEO';
import { getOrganizationSchema, getWebsiteSchema, getCarRentalServiceSchema } from '../utils/structuredData';
import storePic from '../assets/store pic.jpg';
import { toast } from 'react-toastify';
import api from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const { language, setSelectedCar, currency } = useApp();
  const t = useTranslation(language);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef([]);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState(false);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [reviewFormValidated, setReviewFormValidated] = useState(false);
  const [reviewFormRef, setReviewFormRef] = useState(null);
  const [validatedReviewData, setValidatedReviewData] = useState(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Conversion rate: 1 JOD = 1.41 USD
  const convertPrice = (priceJOD) => {
    return currency === "USD" ? (priceJOD * 1.41).toFixed(2) : priceJOD;
  };

  const currencySymbol = currency === "USD" ? "$" : "JOD";

  // Fetch featured cars and reviews from API
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cars using API service (with automatic retry and caching)
      const carsData = await api.cars.getAll();
      // Ensure carsData is an array
      const carsArray = Array.isArray(carsData) ? carsData : [];
      const shuffled = [...carsArray].sort(() => 0.5 - Math.random());
      setFeaturedCars(shuffled.slice(0, 6));

      // Fetch reviews (if endpoint exists)
      try {
        const reviewsData = await api.reviews.getAll();
        // Ensure reviewsData is an array
        const reviewsArray = Array.isArray(reviewsData) ? reviewsData : [];
        setReviews(reviewsArray.slice(0, 6));
      } catch (reviewErr) {
        // Reviews are optional, don't fail the whole page
        console.log('Reviews not available:', reviewErr.message);
        setReviews([]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err);
      const errorMsg = getErrorMessage(err, language);
      toast.error(errorMsg);
      setFeaturedCars([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
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

  // Validate review form before showing Turnstile
  const validateReviewForm = () => {
    if (!reviewFormRef) return false;

    const formData = new FormData(reviewFormRef);
    const name = formData.get('name');
    const comment = formData.get('comment');

    if (!name || name.trim().length === 0) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسمك' : 'Please enter your name');
      return false;
    }

    if (selectedRating === 0) {
      toast.error(language === 'ar' ? 'يرجى اختيار التقييم' : 'Please select a rating');
      return false;
    }

    if (!comment || comment.trim().length === 0) {
      toast.error(language === 'ar' ? 'يرجى كتابة تعليقك' : 'Please write your comment');
      return false;
    }

    if (comment.trim().length < 10) {
      toast.error(language === 'ar'
        ? 'يجب أن يكون التعليق على الأقل 10 أحرف'
        : 'Comment must be at least 10 characters');
      return false;
    }

    // Validation passed - store the form data
    setValidatedReviewData({
      customer_name: name,
      rating: selectedRating,
      comment: comment
    });
    setReviewFormValidated(true);
    toast.success(language === 'ar'
      ? 'تم التحقق من النموذج بنجاح! يرجى إكمال التحقق الأمني.'
      : 'Form validated successfully! Please complete security verification.', {
      autoClose: 3000
    });

    // Scroll to Turnstile section
    setTimeout(() => {
      document.getElementById('review-turnstile-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);

    return true;
  };

  // Structured data for homepage
  const structuredData = [
    getOrganizationSchema(),
    getWebsiteSchema(),
    getCarRentalServiceSchema()
  ];

  return (
    <div className={language === 'ar' ? 'rtl' : 'ltr'}>
      <SEO
        title={language === 'ar' ? 'الفخامة لتأجير السيارات - أفضل خدمة تأجير سيارات في الأردن' : 'Al-Fakhama Car Rental - Premium Car Rental in Jordan'}
        description={language === 'ar'
          ? 'تأجير سيارات فاخرة واقتصادية في الأردن. أسعار تنافسية، دعم على مدار الساعة، وتوصيل مجاني للمطار.'
          : 'Rent luxury, SUV, and economy cars in Jordan. Competitive rates, 24/7 support, and free airport delivery. Book your car today!'
        }
        keywords="car rental Jordan, rent a car Amman, luxury car rental, SUV rental Jordan, economy car rental, airport car rental, تأجير سيارات الأردن, تأجير سيارات عمان"
        ogType="website"
        structuredData={structuredData}
        lang={language}
      />
      <section className="relative bg-gradient-to-br from-blue-900 via-slate-700 to-slate-600 text-white">
        <div className="relative h-[500px] md:h-[600px]">
          <img
            src={storePic}
            alt="Al-Fakhama Car Rental storefront in Amman, Jordan - Premium car rental services"
            className="w-full h-full object-cover"
            loading="eager"
            width="1920"
            height="600"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-2xl">{t('heroTitle')}</h1>
                <p className="text-xl mb-8 opacity-90 drop-shadow-lg">{t('heroSubtitle')}</p>
                <button
                  onClick={() => navigate('/cars')}
                  className="bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
                >
                  {t('searchCars')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={addToRefs}
        className="py-16 bg-gray-50 overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className={`transition-all duration-1000 ${
            visibleSections.has(0) ? 'opacity-100 translate-x-0' : language === 'ar' ? 'opacity-0 translate-x-20' : 'opacity-0 -translate-x-20'
          }`}>
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">{t('whyChooseUs')}</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              {language === 'ar'
                ? 'نقدم أفضل خدمات تأجير السيارات في الأردن مع أسعار تنافسية وخدمة عملاء متميزة'
                : 'We provide the best car rental services in Jordan with competitive prices and excellent customer service'}
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: language === 'ar' ? 'تأمين شامل' : 'Full Insurance', desc: language === 'ar' ? 'تأمين كامل على جميع السيارات' : 'Comprehensive coverage on all vehicles', side: 'left' },
              { icon: Clock, title: language === 'ar' ? 'خدمة 24/7' : '24/7 Service', desc: language === 'ar' ? 'دعم على مدار الساعة' : 'Round the clock support', side: 'left' },
              { icon: Award, title: language === 'ar' ? 'سيارات حديثة' : 'Modern Fleet', desc: language === 'ar' ? 'أحدث موديلات السيارات' : 'Latest car models', side: 'right' },
              { icon: Users, title: language === 'ar' ? 'فريق محترف' : 'Professional Team', desc: language === 'ar' ? 'فريق ذو خبرة واسعة' : 'Experienced staff', side: 'right' }
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`text-center p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all duration-700 transform hover:scale-105 ${
                  visibleSections.has(0)
                    ? 'opacity-100 translate-x-0'
                    : feature.side === 'left'
                      ? 'opacity-0 -translate-x-32'
                      : 'opacity-0 translate-x-32'
                }`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className="inline-block p-4 bg-blue-900 rounded-full mb-4">
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section
        ref={addToRefs}
        className="py-16 bg-white overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className={`transition-all duration-1000 ${
            visibleSections.has(1) ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              {language === 'ar' ? 'سياراتنا المميزة' : 'Featured Cars'}
            </h2>
          </div>

          {loading ? (
            <CarCardSkeletonGrid count={3} />
          ) : error ? (
            <ErrorMessage
              message={getErrorMessage(error, language)}
              type={isNetworkError(error) ? 'network' : 'error'}
              onRetry={loadData}
            />
          ) : featuredCars.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              {language === 'ar' ? 'لا توجد سيارات متاحة' : 'No cars available'}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredCars.slice(0, 3).map((car, idx) => (
                <div
                  key={car.id}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-800 transform hover:-translate-y-2 ${
                    visibleSections.has(1)
                      ? 'opacity-100 translate-x-0'
                      : idx === 0
                        ? 'opacity-0 -translate-x-32'
                        : idx === 2
                          ? 'opacity-0 translate-x-32'
                          : 'opacity-0 translate-y-16'
                  }`}
                  style={{ transitionDelay: `${idx * 200}ms` }}
                >
                  <img
                    src={getCarImage(car.car_barnd, car.car_type, car.image_url)}
                    alt={`Rent ${car.car_barnd} ${car.car_type} ${car.car_model} in Jordan - ${currency === 'USD' ? '$' : ''} ${convertPrice(car.price_per_day)} per day`}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    width="400"
                    height="192"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{car.car_barnd} {car.car_type}</h3>
                    <p className="text-gray-500 text-sm mb-2 italic">{t('orSimilar')}</p>
                    <p className="text-gray-600 mb-4">{t('model')}: {car.car_model} • {t('color')}: {car.car_color || 'N/A'}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-2xl font-bold text-blue-900">
                        {currencySymbol} {convertPrice(car.price_per_day)} <span className="text-sm text-gray-500">{t('perDay')}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        car.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {car.status === 'available' ? t('available') : (language === 'ar' ? 'مؤجرة' : 'Rented')}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCar(car);
                        navigate('/booking');
                      }}
                      disabled={car.status !== 'available'}
                      className="w-full bg-gradient-to-r from-blue-900 to-slate-600 text-white py-3 rounded-lg hover:opacity-90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('bookNow')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/cars')}
              className="bg-gradient-to-r from-blue-900 to-slate-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105"
            >
              {language === 'ar' ? 'عرض جميع السيارات' : 'View All Cars'}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={addToRefs}
        className="py-16 bg-gradient-to-r from-blue-900 to-slate-700 text-white overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '5000+', label: language === 'ar' ? 'عميل سعيد' : 'Happy Clients', side: 'left' },
              { value: `${featuredCars.length * 2}+`, label: language === 'ar' ? 'سيارة متاحة' : 'Cars Available', side: 'left' },
              { value: '15+', label: language === 'ar' ? 'سنة خبرة' : 'Years Experience', side: 'right' },
              { value: '24/7', label: language === 'ar' ? 'دعم العملاء' : 'Customer Support', side: 'right' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`transition-all duration-800 ${
                  visibleSections.has(2)
                    ? 'opacity-100 translate-x-0 scale-100'
                    : stat.side === 'left'
                      ? 'opacity-0 -translate-x-20 scale-50'
                      : 'opacity-0 translate-x-20 scale-50'
                }`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={addToRefs}
        className="py-16 bg-gray-50 overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className={`transition-all duration-1000 ${
            visibleSections.has(3) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}>
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
              {language === 'ar' ? 'آراء العملاء' : 'Customer Reviews'}
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              {language === 'ar'
                ? 'اكتشف تجارب عملائنا السعداء'
                : 'Discover the experiences of our happy customers'}
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.slice(0, 3).map((review, idx) => (
                <div
                  key={review.id}
                  className={`bg-gray-50 p-6 rounded-xl shadow-lg transition-all duration-800 hover:shadow-2xl ${
                    visibleSections.has(3)
                      ? 'opacity-100 translate-x-0 translate-y-0'
                      : idx === 0
                        ? 'opacity-0 -translate-x-32'
                        : idx === 2
                          ? 'opacity-0 translate-x-32'
                          : 'opacity-0 translate-y-16'
                  }`}
                  style={{ transitionDelay: `${idx * 200}ms` }}
                >
                  <div className="flex mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-500 fill-yellow-500" size={20} />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{review.comment}"</p>
                  <p className="font-bold text-gray-800">{review.customer_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              {language === 'ar' ? 'لا توجد آراء بعد' : 'No reviews yet'}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={addToRefs}
        className="py-16 bg-white overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className={`transition-all duration-1000 ${
            visibleSections.has(4) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}>
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
              {language === 'ar' ? 'كيف يعمل؟' : 'How It Works?'}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: Car,
                title: language === 'ar' ? 'اختر سيارتك' : 'Choose Your Car',
                desc: language === 'ar'
                  ? 'تصفح مجموعة واسعة من السيارات واختر ما يناسبك'
                  : 'Browse a wide range of cars and choose what suits you',
                side: 'left'
              },
              {
                step: '2',
                icon: CheckCircle,
                title: language === 'ar' ? 'احجز عبر الإنترنت' : 'Book Online',
                desc: language === 'ar'
                  ? 'املأ نموذج الحجز وحدد التواريخ'
                  : 'Fill the booking form and select dates',
                side: 'bottom'
              },
              {
                step: '3',
                icon: Zap,
                title: language === 'ar' ? 'استلم سيارتك' : 'Get Your Car',
                desc: language === 'ar'
                  ? 'استلم سيارتك وابدأ رحلتك'
                  : 'Pick up your car and start your journey',
                side: 'right'
              }
            ].map((step, idx) => (
              <div
                key={idx}
                className={`text-center relative transition-all duration-800 ${
                  visibleSections.has(4)
                    ? 'opacity-100 translate-x-0 translate-y-0'
                    : step.side === 'left'
                      ? 'opacity-0 -translate-x-32'
                      : step.side === 'right'
                        ? 'opacity-0 translate-x-32'
                        : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: `${idx * 200}ms` }}
              >
                <div className="relative inline-block mb-6">
                  <div className="absolute -top-2 -right-2 bg-blue-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10">
                    {step.step}
                  </div>
                  <div className="p-6 bg-white rounded-full shadow-lg">
                    <step.icon className="text-blue-900" size={48} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Review Section */}
      <section
        ref={addToRefs}
        className="py-20 bg-gray-50 overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className={`max-w-2xl mx-auto transition-all duration-1000 ${
            visibleSections.has(5) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="text-center mb-8">
              <Star className="mx-auto mb-4 text-yellow-500" size={48} />
              <h2 className="text-4xl font-bold mb-4 text-blue-900">
                {language === 'ar' ? 'شاركنا تجربتك' : 'Share Your Experience'}
              </h2>
              <p className="text-gray-600">
                {language === 'ar'
                  ? 'رأيك يهمنا! شارك تجربتك معنا'
                  : 'Your opinion matters! Share your experience with us'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8">
              <form
                ref={(el) => setReviewFormRef(el)}
                onSubmit={async (e) => {
                  e.preventDefault();

                  // Use validated data stored during validation
                  const reviewData = {
                    ...validatedReviewData,
                    turnstileToken
                  };

                  try {
                    await api.reviews.submit(reviewData);
                    toast.success(language === 'ar'
                      ? 'شكراً لك! سيتم مراجعة تقييمك قريباً'
                      : 'Thank you! Your review will be reviewed soon');
                    e.target.reset();
                    setSelectedRating(0);
                    setTurnstileToken('');
                    setReviewFormValidated(false);
                    setValidatedReviewData(null);
                  } catch (error) {
                    console.error('Error submitting review:', error);
                    const errorMsg = error.response?.data?.error || (language === 'ar' ? 'فشل إرسال التقييم' : 'Failed to submit review');
                    toast.error(errorMsg);
                  }
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الاسم' : 'Name'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    disabled={reviewFormValidated}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'التقييم' : 'Rating'} *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => !reviewFormValidated && setSelectedRating(star)}
                        disabled={reviewFormValidated}
                        className="focus:outline-none disabled:cursor-not-allowed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className={`w-10 h-10 transition-colors ${
                            star <= selectedRating
                              ? 'text-yellow-500 fill-yellow-500'
                              : reviewFormValidated
                                ? 'text-gray-300 fill-gray-300'
                                : 'text-gray-300 fill-gray-300 hover:text-yellow-400 hover:fill-yellow-400'
                          }`}
                          style={{ cursor: reviewFormValidated ? 'not-allowed' : 'pointer' }}
                        >
                          <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                  {selectedRating > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedRating} {language === 'ar' ? 'نجوم' : 'stars'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'التعليق' : 'Comment'} *
                  </label>
                  <textarea
                    name="comment"
                    required
                    rows="4"
                    disabled={reviewFormValidated}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={language === 'ar' ? 'أخبرنا عن تجربتك...' : 'Tell us about your experience...'}
                  ></textarea>
                </div>

                {/* Step 1: Validate Form Button (shown before validation) */}
                {!reviewFormValidated && (
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
                      onClick={validateReviewForm}
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
                {reviewFormValidated && (
                  <div id="review-turnstile-section" className="space-y-4">
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
                            setReviewFormValidated(false);
                            setTurnstileToken('');
                            setTurnstileError(false);
                            setValidatedReviewData(null);
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
                            size="normal"
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
                        className="w-full bg-gradient-to-r from-blue-900 to-slate-600 text-white py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
                      >
                        {language === 'ar' ? 'إرسال التقييم' : 'Submit Review'}
                      </button>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={addToRefs}
        className="py-20 bg-gradient-to-r from-blue-900 to-slate-700 text-white overflow-hidden"
      >
        <div className="container mx-auto px-4 text-center">
          <div className={`transition-all duration-1000 ${
            visibleSections.has(6) ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-10'
          }`}>
            <Heart className="mx-auto mb-6 text-red-400" size={64} />
            <h2 className="text-4xl font-bold mb-4">
              {language === 'ar' ? 'مستعد للبدء؟' : 'Ready to Get Started?'}
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {language === 'ar'
                ? 'احجز سيارتك الآن واستمتع بتجربة قيادة لا تُنسى'
                : 'Book your car now and enjoy an unforgettable driving experience'}
            </p>
            <button
              onClick={() => navigate('/cars')}
              className="bg-white text-blue-900 px-10 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-110 shadow-2xl"
            >
              {t('bookNow')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;