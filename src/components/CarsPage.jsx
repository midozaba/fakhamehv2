import React from 'react';
import { useTranslation } from '../utils/translations';
import { getCarImage, categorizeCarType } from '../utils/carHelpers';
import carsData from '../data/cars.json';

const CarsPage = ({ language, searchFilters, setSearchFilters, setSelectedCar, setCurrentPage, currency }) => {
  const t = useTranslation(language);

  // Conversion rate: 1 JOD = 1.41 USD
  const convertPrice = (priceJOD) => {
    return currency === "USD" ? (priceJOD * 1.41).toFixed(2) : priceJOD;
  };

  const currencySymbol = currency === "USD" ? "$" : "JOD";

  const filteredCars = carsData.filter(car => {
    if (searchFilters.category !== 'all') {
      const category = categorizeCarType(car.CAR_TYPE);
      if (category !== searchFilters.category) return false;
    }
    if (searchFilters.priceRange !== 'all') {
      if (searchFilters.priceRange === 'low' && car.PRICEPERDAY > 25) return false;
      if (searchFilters.priceRange === 'medium' && (car.PRICEPERDAY < 26 || car.PRICEPERDAY > 40)) return false;
      if (searchFilters.priceRange === 'high' && car.PRICEPERDAY < 41) return false;
    }
    return true;
  });

  return (
    <div className={`${language === 'ar' ? 'rtl' : 'ltr'} py-8`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">{t('cars')}</h2>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={searchFilters.category}
                onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="all">All Categories</option>
                <option value="economy">{t('economy')}</option>
                <option value="sedan">{t('sedan')}</option>
                <option value="suv">{t('suv')}</option>
                <option value="van">{t('van')}</option>
                <option value="luxury">{t('luxury')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <select
                value={searchFilters.priceRange}
                onChange={(e) => setSearchFilters({ ...searchFilters, priceRange: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="all">All Prices</option>
                <option value="low">JOD 15-25 per day</option>
                <option value="medium">JOD 26-40 per day</option>
                <option value="high">JOD 41+ per day</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map(car => (
            <div key={car.car_id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
              <img
                src={getCarImage(car.car_barnd, car.CAR_TYPE)}
                alt={`${car.car_barnd} ${car.CAR_TYPE}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{car.car_barnd} {car.CAR_TYPE}</h3>
                <p className="text-gray-500 text-sm mb-2 italic">{t('orSimilar')}</p>
                <div className="text-sm text-gray-600 mb-4">
                  <p>{t('model')}: {car.CAR_MODEL}</p>
                  <p>{t('color')}: {t(car.car_color)}</p>
                  <p>Category: {t(categorizeCarType(car.CAR_TYPE))}</p>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {currencySymbol} {convertPrice(car.PRICEPERDAY)} <span className="text-sm text-gray-500">{t('perDay')}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {currencySymbol} {convertPrice(car.priceperweek)} {t('perWeek')} • {currencySymbol} {convertPrice(car.pricepermonth)} {t('perMonth')}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCar(car);
                    setCurrentPage('booking');
                  }}
                  className="w-full bg-gradient-to-r from-blue-900 to-slate-600 text-white py-3 rounded-lg hover:opacity-90 transition-all font-semibold"
                >
                  {t('bookNow')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarsPage;