import React from 'react';
import { Car, Shield } from 'lucide-react';
import { useTranslation } from '../utils/translations';
import { getCarImage } from '../utils/carHelpers';
import carsData from '../data/cars.json';

const HomePage = ({ language, setCurrentPage, setSelectedCar }) => {
  const t = useTranslation(language);

  return (
    <div className={language === 'ar' ? 'rtl' : 'ltr'}>
      <section className="relative bg-gradient-to-br from-blue-900 via-slate-700 to-slate-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{t('heroTitle')}</h1>
            <p className="text-xl mb-8 opacity-90">{t('heroSubtitle')}</p>
            <button
              onClick={() => setCurrentPage('cars')}
              className="bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
            >
              {t('searchCars')}
            </button>
          </div>
        </div>

        <div className="absolute top-20 left-10 opacity-10">
          <Car size={100} />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10">
          <Shield size={80} />
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">{t('cars')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {carsData.slice(0, 3).map(car => (
              <div key={car.car_id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2">
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
                      ${car.PRICEPERDAY} <span className="text-sm text-gray-500">{t('perDay')}</span>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {t('available')}
                    </span>
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
      </section>
    </div>
  );
};

export default HomePage;