import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Shield, Clock, Award, Users, MapPin, Phone, Mail, Star, CheckCircle, Zap, Heart } from 'lucide-react';
import { useTranslation } from '../utils/translations';
import { getCarImage } from '../utils/carHelpers';
import carsData from '../data/cars.json';
import storePic from '../assets/store pic.jpg';

const HomePage = ({ language, setSelectedCar, currency }) => {
  const navigate = useNavigate();
  const t = useTranslation(language);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef([]);

  // Conversion rate: 1 JOD = 1.41 USD
  const convertPrice = (priceJOD) => {
    return currency === "USD" ? (priceJOD * 1.41).toFixed(2) : priceJOD;
  };

  const currencySymbol = currency === "USD" ? "$" : "JOD";

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

  return (
    <div className={language === 'ar' ? 'rtl' : 'ltr'}>
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
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">{t('cars')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {carsData.slice(0, 3).map((car, idx) => (
              <div
                key={car.car_id}
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
                  src={getCarImage(car.car_barnd, car.CAR_TYPE)}
                  alt={`${car.car_barnd} ${car.CAR_TYPE}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{car.car_barnd} {car.CAR_TYPE}</h3>
                  <p className="text-gray-500 text-sm mb-2 italic">{t('orSimilar')}</p>
                  <p className="text-gray-600 mb-4">{t('model')}: {car.CAR_MODEL} • {t('color')}: {t(car.car_color)}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-2xl font-bold text-blue-900">
                      {currencySymbol} {convertPrice(car.PRICEPERDAY)} <span className="text-sm text-gray-500">{t('perDay')}</span>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {t('available')}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCar(car);
                      navigate('/booking');
                    }}
                    className="w-full bg-gradient-to-r from-blue-900 to-slate-600 text-white py-3 rounded-lg hover:opacity-90 transition-all font-semibold"
                  >
                    {t('bookNow')}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
              { value: '50+', label: language === 'ar' ? 'سيارة متاحة' : 'Cars Available', side: 'left' },
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
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: language === 'ar' ? 'أحمد محمد' : 'Ahmed Mohammed',
                rating: 5,
                comment: language === 'ar'
                  ? 'خدمة ممتازة وسيارات نظيفة. أنصح بشدة!'
                  : 'Excellent service and clean cars. Highly recommended!',
                side: 'left'
              },
              {
                name: language === 'ar' ? 'سارة علي' : 'Sarah Ali',
                rating: 5,
                comment: language === 'ar'
                  ? 'أسعار معقولة وموظفين محترفين جداً'
                  : 'Reasonable prices and very professional staff',
                side: 'bottom'
              },
              {
                name: language === 'ar' ? 'خالد حسن' : 'Khaled Hassan',
                rating: 5,
                comment: language === 'ar'
                  ? 'تجربة رائعة! السيارة كانت بحالة ممتازة'
                  : 'Great experience! The car was in excellent condition',
                side: 'right'
              }
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className={`bg-gray-50 p-6 rounded-xl shadow-lg transition-all duration-800 hover:shadow-2xl ${
                  visibleSections.has(3)
                    ? 'opacity-100 translate-x-0 translate-y-0'
                    : testimonial.side === 'left'
                      ? 'opacity-0 -translate-x-32'
                      : testimonial.side === 'right'
                        ? 'opacity-0 translate-x-32'
                        : 'opacity-0 translate-y-16'
                }`}
                style={{ transitionDelay: `${idx * 200}ms` }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-500 fill-yellow-500" size={20} />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                <p className="font-bold text-gray-800">{testimonial.name}</p>
              </div>
            ))}
          </div>
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

      {/* CTA Section */}
      <section
        ref={addToRefs}
        className="py-20 bg-gradient-to-r from-blue-900 to-slate-700 text-white overflow-hidden"
      >
        <div className="container mx-auto px-4 text-center">
          <div className={`transition-all duration-1000 ${
            visibleSections.has(5) ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-10'
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