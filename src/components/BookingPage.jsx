import React from 'react';
import { ChevronLeft, ChevronRight, Users, Fuel, Shield, Star, Phone, Wifi, MapPin } from 'lucide-react';
import { useTranslation } from '../utils/translations';
import { getCarImage, calculatePrice } from '../utils/carHelpers';

const BookingPage = ({
  language,
  selectedCar,
  bookingData,
  setBookingData,
  setCurrentPage,
  handleBookingSubmit,
  currency
}) => {
  const t = useTranslation(language);
  const pricing = calculatePrice(selectedCar, bookingData);

  // Conversion rate: 1 JOD = 1.41 USD
  const convertPrice = (priceJOD) => {
    return currency === "USD" ? (priceJOD * 1.41).toFixed(2) : priceJOD;
  };

  const currencySymbol = currency === "USD" ? "$" : "JOD";

  return (
    <div className={`${language === 'ar' ? 'rtl' : 'ltr'} py-8`}>
      <div className="container mx-auto px-4">
        <button
          onClick={() => setCurrentPage('cars')}
          className="mb-6 flex items-center text-blue-900 hover:text-blue-700"
        >
          {language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {t('backToHome')}
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <img
              src={getCarImage(selectedCar.car_barnd, selectedCar.CAR_TYPE)}
              alt={`${selectedCar.car_barnd} ${selectedCar.CAR_TYPE}`}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedCar.car_barnd} {selectedCar.CAR_TYPE}</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-gray-600">{t('model')}:</span>
                  <span className="ml-2 font-semibold">{selectedCar.CAR_MODEL}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('color')}:</span>
                  <span className="ml-2 font-semibold">{t(selectedCar.car_color)}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-3">Pricing Options</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('perDay')}:</span>
                    <span className="font-bold">{currencySymbol} {convertPrice(selectedCar.PRICEPERDAY)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('perWeek')}:</span>
                    <span className="font-bold">{currencySymbol} {convertPrice(selectedCar.priceperweek)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('perMonth')}:</span>
                    <span className="font-bold">{currencySymbol} {convertPrice(selectedCar.pricepermonth)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="text-blue-900" size={20} />
                  <span className="text-sm">5 Seats</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fuel className="text-blue-900" size={20} />
                  <span className="text-sm">Automatic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="text-blue-900" size={20} />
                  <span className="text-sm">Full Insurance Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-500" size={20} />
                  <span className="text-sm">Premium Quality</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t('selectDates')}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('pickupDate')}</label>
                  <input
                    type="date"
                    value={bookingData.pickupDate}
                    onChange={(e) => {
                      setBookingData({ ...bookingData, pickupDate: e.target.value });
                      if (bookingData.returnDate) {
                        const days = Math.ceil((new Date(bookingData.returnDate) - new Date(e.target.value)) / (1000 * 60 * 60 * 24));
                        setBookingData(prev => ({ ...prev, days: Math.max(1, days) }));
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('returnDate')}</label>
                  <input
                    type="date"
                    value={bookingData.returnDate}
                    onChange={(e) => {
                      setBookingData({ ...bookingData, returnDate: e.target.value });
                      if (bookingData.pickupDate) {
                        const days = Math.ceil((new Date(e.target.value) - new Date(bookingData.pickupDate)) / (1000 * 60 * 60 * 24));
                        setBookingData(prev => ({ ...prev, days: Math.max(1, days) }));
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                    min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <span className="font-medium">{t('totalDays')}: {bookingData.days} days</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t('insurance')}</h3>
              <div className="space-y-3">
                {[
                  { id: 'basic', name: t('basicInsurance'), priceJOD: 5, desc: 'Basic coverage for accidents' },
                  { id: 'full', name: t('fullInsurance'), priceJOD: 10, desc: 'Comprehensive coverage' },
                  { id: 'premium', name: t('premiumInsurance'), priceJOD: 15, desc: 'Premium coverage with 24/7 support' }
                ].map(insurance => (
                  <label key={insurance.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="insurance"
                      value={insurance.id}
                      checked={bookingData.insurance === insurance.id}
                      onChange={(e) => setBookingData({ ...bookingData, insurance: e.target.value })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{insurance.name}</span>
                        <span className="text-blue-900 font-bold">{currencySymbol} {convertPrice(insurance.priceJOD)}/day</span>
                      </div>
                      <p className="text-sm text-gray-600">{insurance.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t('additionalServices')}</h3>
              <div className="space-y-3">
                {[
                  { id: 'phone', name: t('mobilePhone'), priceJOD: 3, icon: Phone },
                  { id: 'wifi', name: t('wifi'), priceJOD: 2, icon: Wifi },
                  { id: 'gps', name: t('gps'), priceJOD: 2, icon: MapPin },
                  { id: 'childSeat', name: t('childSeat'), priceJOD: 1, icon: Shield }
                ].map(service => (
                  <label key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingData.additionalServices.includes(service.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBookingData({ ...bookingData, additionalServices: [...bookingData.additionalServices, service.id] });
                        } else {
                          setBookingData({ ...bookingData, additionalServices: bookingData.additionalServices.filter(s => s !== service.id) });
                        }
                      }}
                    />
                    <service.icon className="text-blue-900" size={20} />
                    <div className="flex-1 flex justify-between items-center">
                      <span>{service.name}</span>
                      <span className="text-blue-900 font-bold">{currencySymbol} {convertPrice(service.priceJOD)}/day</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t('customerInfo')}</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t('fullName')}
                  value={bookingData.customerInfo.name}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    customerInfo: { ...bookingData.customerInfo, name: e.target.value }
                  })}
                  className="w-full p-3 border rounded-lg"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
                <input
                  type="email"
                  placeholder={t('email')}
                  value={bookingData.customerInfo.email}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    customerInfo: { ...bookingData.customerInfo, email: e.target.value }
                  })}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="tel"
                  placeholder={t('phone')}
                  value={bookingData.customerInfo.phone}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    customerInfo: { ...bookingData.customerInfo, phone: e.target.value }
                  })}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder={t('licenseNumber')}
                  value={bookingData.customerInfo.license}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    customerInfo: { ...bookingData.customerInfo, license: e.target.value }
                  })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t('totalPrice')}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>{t('basePrice')} ({bookingData.days} days):</span>
                  <span>{currencySymbol} {convertPrice(pricing.basePrice)}</span>
                </div>
                {pricing.insurancePrice > 0 && (
                  <div className="flex justify-between">
                    <span>{t('insurancePrice')}:</span>
                    <span>{currencySymbol} {convertPrice(pricing.insurancePrice)}</span>
                  </div>
                )}
                {pricing.servicesPrice > 0 && (
                  <div className="flex justify-between">
                    <span>{t('servicesPrice')}:</span>
                    <span>{currencySymbol} {convertPrice(pricing.servicesPrice)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-xl font-bold text-blue-900">
                    <span>{t('totalPrice')}:</span>
                    <span>{currencySymbol} {convertPrice(pricing.total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookingSubmit}
                className="w-full bg-gradient-to-r from-blue-900 to-slate-600 text-white py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105"
              >
                {t('confirmBooking')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;