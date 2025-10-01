import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Users, Fuel, Shield, Star, Phone, Wifi, MapPin } from 'lucide-react';
import { useTranslation } from '../utils/translations';
import { getCarImage, calculatePrice } from '../utils/carHelpers';

const BookingPage = ({
  language,
  selectedCar,
  bookingData,
  setBookingData,
  handleBookingSubmit,
  currency
}) => {
  const navigate = useNavigate();
  const t = useTranslation(language);

  // If no car selected, redirect to cars page
  if (!selectedCar) {
    navigate('/cars');
    return null;
  }

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
          onClick={() => navigate('/cars')}
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
                {/* Airport Pickup - Featured Service */}
                <div className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                      <Star className="w-3 h-3 fill-current" />
                      {language === 'ar' ? 'جديد!' : 'NEW!'}
                    </span>
                  </div>
                  <label className="flex items-start space-x-3 p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 cursor-pointer transition-all bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 animate-shimmer"></div>
                    <input
                      type="checkbox"
                      checked={bookingData.additionalServices.includes('airportPickup')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBookingData({ ...bookingData, additionalServices: [...bookingData.additionalServices, 'airportPickup'] });
                        } else {
                          setBookingData({ ...bookingData, additionalServices: bookingData.additionalServices.filter(s => s !== 'airportPickup') });
                        }
                      }}
                      className="mt-1 relative z-10"
                    />
                    <div className="relative z-10 bg-blue-600 p-3 rounded-lg">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-900">
                              {language === 'ar' ? 'خدمة التوصيل من المطار' : 'Airport Pickup Service'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {language === 'ar'
                              ? 'نقوم بتوصيل سيارتك إلى مطار الملكة علياء الدولي'
                              : 'We deliver your car to Queen Alia International Airport'}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-blue-900 font-bold text-lg">{currencySymbol} {convertPrice(25)}</div>
                          <div className="text-xs text-gray-600 font-medium">
                            {language === 'ar' ? 'دفعة واحدة' : 'One-time fee'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Regular Services */}
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
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fullName')} *
                  </label>
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
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      placeholder={t('email')}
                      value={bookingData.customerInfo.email}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        customerInfo: { ...bookingData.customerInfo, email: e.target.value }
                      })}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('phone')} *
                    </label>
                    <input
                      type="tel"
                      placeholder={t('phone')}
                      value={bookingData.customerInfo.phone}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        customerInfo: { ...bookingData.customerInfo, phone: e.target.value }
                      })}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('licenseNumber')} *
                  </label>
                  <input
                    type="text"
                    placeholder={t('licenseNumber')}
                    value={bookingData.customerInfo.license}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      customerInfo: { ...bookingData.customerInfo, license: e.target.value }
                    })}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>

                {/* Address Information */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold mb-3">
                    {language === 'ar' ? 'معلومات العنوان *' : 'Address Information *'}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === 'ar' ? 'الشارع / العنوان *' : 'Street Address *'}
                      </label>
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'مثال: شارع الملك حسين، بناية رقم 15' : 'e.g., King Hussein Street, Building 15'}
                        value={bookingData.customerInfo.street || ''}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          customerInfo: { ...bookingData.customerInfo, street: e.target.value }
                        })}
                        className="w-full p-3 border rounded-lg"
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'المدينة *' : 'City *'}
                        </label>
                        <input
                          type="text"
                          placeholder={language === 'ar' ? 'عمان' : 'Amman'}
                          value={bookingData.customerInfo.city || ''}
                          onChange={(e) => setBookingData({
                            ...bookingData,
                            customerInfo: { ...bookingData.customerInfo, city: e.target.value }
                          })}
                          className="w-full p-3 border rounded-lg"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'المنطقة / الحي' : 'Area / District'}
                        </label>
                        <input
                          type="text"
                          placeholder={language === 'ar' ? 'عبدون' : 'Abdoun'}
                          value={bookingData.customerInfo.area || ''}
                          onChange={(e) => setBookingData({
                            ...bookingData,
                            customerInfo: { ...bookingData.customerInfo, area: e.target.value }
                          })}
                          className="w-full p-3 border rounded-lg"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                        </label>
                        <input
                          type="text"
                          placeholder="11941"
                          value={bookingData.customerInfo.postalCode || ''}
                          onChange={(e) => setBookingData({
                            ...bookingData,
                            customerInfo: { ...bookingData.customerInfo, postalCode: e.target.value }
                          })}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === 'ar' ? 'الدولة *' : 'Country *'}
                      </label>
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'الأردن' : 'Jordan'}
                        value={bookingData.customerInfo.country || ''}
                        onChange={(e) => setBookingData({
                          ...bookingData,
                          customerInfo: { ...bookingData.customerInfo, country: e.target.value }
                        })}
                        className="w-full p-3 border rounded-lg"
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">
                {language === 'ar' ? 'المستندات المطلوبة *' : 'Required Documents *'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {language === 'ar'
                  ? 'يرجى تحميل صور واضحة لهويتك وجواز سفرك'
                  : 'Please upload clear photos of your ID and passport'}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'صورة الهوية الوطنية / بطاقة الإقامة *' : 'National ID / Residence Card Photo *'}
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Store file reference (will be uploaded to backend later)
                        setBookingData({
                          ...bookingData,
                          customerInfo: {
                            ...bookingData.customerInfo,
                            idDocument: file,
                            idDocumentName: file.name
                          }
                        });
                      }
                    }}
                    className="w-full p-3 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  {bookingData.customerInfo?.idDocumentName && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {bookingData.customerInfo.idDocumentName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'صورة جواز السفر *' : 'Passport Photo *'}
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Store file reference (will be uploaded to backend later)
                        setBookingData({
                          ...bookingData,
                          customerInfo: {
                            ...bookingData.customerInfo,
                            passportDocument: file,
                            passportDocumentName: file.name
                          }
                        });
                      }
                    }}
                    className="w-full p-3 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  {bookingData.customerInfo?.passportDocumentName && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {bookingData.customerInfo.passportDocumentName}
                    </p>
                  )}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    {language === 'ar'
                      ? '⚠️ تأكد من أن الصور واضحة وجميع التفاصيل مقروءة. الملفات المقبولة: JPG, PNG, PDF'
                      : '⚠️ Make sure photos are clear and all details are readable. Accepted files: JPG, PNG, PDF'}
                  </p>
                </div>
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
                {pricing.airportPickupPrice > 0 && (
                  <div className="flex justify-between items-center bg-blue-50 -mx-2 px-2 py-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-900">
                        {language === 'ar' ? 'خدمة التوصيل من المطار' : 'Airport Pickup'}
                      </span>
                      <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
                        {language === 'ar' ? 'جديد!' : 'NEW'}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-900">{currencySymbol} {convertPrice(pricing.airportPickupPrice)}</span>
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