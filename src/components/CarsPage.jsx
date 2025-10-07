import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/translations';
import { useApp } from '../context/AppContext';
import { getCarImage, categorizeCarType } from '../utils/carHelpers';
import { getErrorMessage, isNetworkError } from '../utils/apiHelpers';
import { CarCardSkeletonGrid } from './common/CarCardSkeleton';
import ErrorMessage from './common/ErrorMessage';
import { toast } from 'react-toastify';
import api from '../services/api';

const CarsPage = () => {
  const navigate = useNavigate();
  const { language, searchFilters, setSearchFilters, setSelectedCar, currency } = useApp();
  const t = useTranslation(language);
  const [visibleCards, setVisibleCards] = useState(new Set());
  const cardRefs = useRef([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Conversion rate: 1 JOD = 1.41 USD
  const convertPrice = (priceJOD) => {
    return currency === "USD" ? (priceJOD * 1.41).toFixed(2) : priceJOD;
  };

  const currencySymbol = currency === "USD" ? "$" : "JOD";

  // Fetch cars from database on component mount
  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use API service with automatic retry and caching
      const data = await api.cars.getAll();
      setCars(data);
    } catch (err) {
      setError(err);
      const errorMsg = getErrorMessage(err, language);
      toast.error(errorMsg);
      console.error('Error loading cars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const filteredCars = cars.filter(car => {
    if (searchFilters.category !== 'all') {
      // Use car_category from database if available, otherwise fallback to categorizeCarType
      const category = car.car_category
        ? car.car_category.toLowerCase()
        : categorizeCarType(car.car_type);
      if (category !== searchFilters.category) return false;
    }
    if (searchFilters.priceRange !== 'all') {
      const pricePerDay = parseFloat(car.price_per_day);
      if (searchFilters.priceRange === 'low' && pricePerDay > 25) return false;
      if (searchFilters.priceRange === 'medium' && (pricePerDay < 26 || pricePerDay > 40)) return false;
      if (searchFilters.priceRange === 'high' && pricePerDay < 41) return false;
    }
    return true;
  });

  useEffect(() => {
    cardRefs.current = [];
    setVisibleCards(new Set([0])); // Make first card visible immediately
  }, [searchFilters]);

  useEffect(() => {
    const observers = [];

    cardRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleCards((prev) => new Set([...prev, index]));
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
  }, [filteredCars]);

  const addToRefs = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  return (
    <div className={`${language === 'ar' ? 'rtl' : 'ltr'} py-8`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">{t('cars')}</h2>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-800">
                {language === 'ar' ? 'الفئة' : 'Category'}
              </label>
              <select
                value={searchFilters.category}
                onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                <option value="sedan">{t('sedan')}</option>
                <option value="suv">{t('suv')}</option>
                <option value="truck">{language === 'ar' ? 'شاحنة' : 'Truck'}</option>
                <option value="van">{t('van')}</option>
                <option value="luxury">{t('luxury')}</option>
                <option value="sports">{language === 'ar' ? 'رياضية' : 'Sports'}</option>
                <option value="economy">{t('economy')}</option>
                <option value="compact">{language === 'ar' ? 'صغيرة' : 'Compact'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-800">
                {language === 'ar' ? 'نطاق السعر' : 'Price Range'}
              </label>
              <select
                value={searchFilters.priceRange}
                onChange={(e) => setSearchFilters({ ...searchFilters, priceRange: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{language === 'ar' ? 'جميع الأسعار' : 'All Prices'}</option>
                <option value="low">JOD 15-25 {language === 'ar' ? 'في اليوم' : 'per day'}</option>
                <option value="medium">JOD 26-40 {language === 'ar' ? 'في اليوم' : 'per day'}</option>
                <option value="high">JOD 41+ {language === 'ar' ? 'في اليوم' : 'per day'}</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <CarCardSkeletonGrid count={6} />
        ) : error ? (
          <ErrorMessage
            message={getErrorMessage(error, language)}
            type={isNetworkError(error) ? 'network' : 'error'}
            onRetry={loadCars}
          />
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">{language === 'ar' ? 'لم يتم العثور على سيارات' : 'No cars found'}</p>
            <p className="text-sm mt-2">{language === 'ar' ? 'حاول تغيير معايير البحث' : 'Try changing the search filters'}</p>
          </div>
        ) : (
          <>
            {/* Cars Grid */}
            <div className={`${language === 'ar' ? 'rtl' : 'ltr'} grid grid-cols-1 lg:grid-cols-3 gap-6`}>
              {filteredCars.map((car, idx) => {
                const position = idx % 3; // 0: left, 1: center, 2: right
                return (
                  <div
                    key={car.car_id}
                    ref={addToRefs}
                    className={`relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-700 group cursor-pointer ${
                      visibleCards.has(idx)
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-75'
                    }`}
                    style={{ transitionDelay: `${position * 150}ms` }}
                  >
                    {/* Car Image */}
                    <div className="w-full aspect-[16/9]">
                      <img
                        src={getCarImage(car.car_barnd, car.car_type)}
                        alt={`${car.car_barnd} ${car.car_type} ${car.car_model} for rent - Starting at ${currency === 'USD' ? '$' : 'JOD'} ${convertPrice(car.price_per_day)}/day`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width="640"
                        height="360"
                      />
                    </div>

                    {/* Hover Overlay with Information */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-3">
                      <h3 className="text-lg font-bold mb-1 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        {car.car_barnd} {car.car_type}
                      </h3>
                      <p className="text-gray-200 text-xs mb-2 italic transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        {t('orSimilar')}
                      </p>
                      <div className="text-xs text-gray-200 mb-2 space-y-0.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                        <p>{t('model')}: {car.car_model}</p>
                        <p>{t('color')}: {t(car.car_color)}</p>
                        <p>Category: {car.car_category || t(categorizeCarType(car.car_type))}</p>
                      </div>
                      <div className="mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">
                        <div className="text-xl font-bold text-white">
                          {currencySymbol} {convertPrice(parseFloat(car.price_per_day))} <span className="text-sm text-gray-300">{t('perDay')}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCar(car);
                          navigate('/booking');
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 text-sm rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all font-semibold transform translate-y-4 group-hover:translate-y-0 duration-500 delay-200 shadow-lg"
                      >
                        {t('bookNow')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCars.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <p className="text-gray-600">No cars found matching your filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CarsPage;