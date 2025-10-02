import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Shield, Clock, Award, Users, MapPin, Phone, Mail, Star, CheckCircle, Zap, Heart } from 'lucide-react';
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
      const shuffled = [...carsData].sort(() => 0.5 - Math.random());
      setFeaturedCars(shuffled.slice(0, 6));

      // Fetch reviews (if endpoint exists)
      try {
        const reviewsData = await api.client.get('/reviews');
        setReviews(reviewsData.data.slice(0, 6));
      } catch (reviewErr) {
        // Reviews are optional, don't fail the whole page
        console.log('Reviews not available');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err);
      const errorMsg = getErrorMessage(err, language);
      toast.error(errorMsg);
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
            alt="Al-Fakhama Car Rental Store"
            className="w-full h-full object-cover"
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
                    src={car.image_url || getCarImage(car.car_barnd, car.car_type)}
                    alt={`${car.car_barnd} ${car.car_type}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{car.car_barnd} {car.car_type}</h3>
                    <p className="text-gray-500 text-sm mb-2 italic">{t('orSimilar')}</p>
                    <p className="text-gray-600 mb-4">{t('model')}: {car.car_model} • {t('color')}: {car.car_color}</p>
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
              <form onSubmit={async (e) => {
                e.preventDefault();

                if (selectedRating === 0) {
                  toast.error(language === 'ar' ? 'الرجاء اختيار التقييم' : 'Please select a rating');
                  return;
                }

                const formData = new FormData(e.target);
                const reviewData = {
                  customer_name: formData.get('name'),
                  rating: selectedRating,
                  comment: formData.get('comment')
                };

                try {
                  const response = await fetch('/api/reviews/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reviewData)
                  });

                  if (response.ok) {
                    toast.success(language === 'ar'
                      ? 'شكراً لك! سيتم مراجعة تقييمك قريباً'
                      : 'Thank you! Your review will be reviewed soon');
                    e.target.reset();
                    setSelectedRating(0);
                  } else {
                    toast.error(language === 'ar' ? 'فشل إرسال التقييم' : 'Failed to submit review');
                  }
                } catch (error) {
                  toast.error(language === 'ar' ? 'خطأ في الاتصال' : 'Connection error');
                }
              }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الاسم' : 'Name'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        onClick={() => setSelectedRating(star)}
                        className="focus:outline-none"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className={`w-10 h-10 transition-colors ${
                            star <= selectedRating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300 fill-gray-300 hover:text-yellow-400 hover:fill-yellow-400'
                          }`}
                          style={{ cursor: 'pointer' }}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={language === 'ar' ? 'أخبرنا عن تجربتك...' : 'Tell us about your experience...'}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-900 to-slate-600 text-white py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105"
                >
                  {language === 'ar' ? 'إرسال التقييم' : 'Submit Review'}
                </button>
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