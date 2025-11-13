import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Users, Fuel, Shield, Star, Phone, Wifi, MapPin, Loader2 } from 'lucide-react';
import Turnstile from 'react-turnstile';
import { useTranslation } from '../utils/translations';
import { useApp } from '../context/AppContext';
import { getCarImage, calculatePrice, locations } from '../utils/carHelpers';

const BookingPage = ({ handleBookingSubmit = () => {} }) => {
  const navigate = useNavigate();
  const { carId } = useParams();
  const { language, selectedCar, bookingData, setBookingData, currency, isSubmitting } = useApp();
  const t = useTranslation(language);
  const [car, setCar] = useState(selectedCar);
  const [loading, setLoading] = useState(!selectedCar && carId);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0); // For forcing Turnstile refresh
  const [turnstileError, setTurnstileError] = useState(false);
  const [formValidated, setFormValidated] = useState(false);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Fetch car if carId is in URL but no selectedCar
  useEffect(() => {
    if (!selectedCar && carId) {
      setLoading(true);
      fetch(`/api/cars/${carId}`)
        .then(res => res.json())
        .then(data => {
          setCar(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching car:', err);
          setLoading(false);
          navigate('/cars');
        });
    } else if (selectedCar) {
      setCar(selectedCar);
      setLoading(false);
    } else if (!selectedCar && !carId) {
      // No car and no carId, redirect
      navigate('/cars');
    }
  }, [carId, selectedCar, navigate]);

  // Ensure days is calculated when dates are set
  useEffect(() => {
    if (bookingData.pickupDate && bookingData.returnDate) {
      const days = Math.ceil((new Date(bookingData.returnDate) - new Date(bookingData.pickupDate)) / (1000 * 60 * 60 * 24));
      if (days > 0 && days !== bookingData.days) {
        setBookingData(prev => ({ ...prev, days: Math.max(1, days) }));
      }
    }
  }, [bookingData.pickupDate, bookingData.returnDate, bookingData.days, setBookingData]);

  if (loading || !car) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Calculate pricing safely
  let pricing;
  try {
    // Ensure days is calculated even if not set yet
    let bookingDataWithDays = { ...bookingData };
    if (!bookingDataWithDays.days || bookingDataWithDays.days < 1) {
      if (bookingDataWithDays.pickupDate && bookingDataWithDays.returnDate) {
        const days = Math.ceil((new Date(bookingDataWithDays.returnDate) - new Date(bookingDataWithDays.pickupDate)) / (1000 * 60 * 60 * 24));
        bookingDataWithDays.days = Math.max(1, days);
      } else {
        bookingDataWithDays.days = 1; // Default to 1 day if dates not set
      }
    }
    pricing = calculatePrice(car, bookingDataWithDays);
  } catch (error) {
    pricing = { basePrice: 0, insurancePrice: 0, servicesPrice: 0, locationPrice: 0, total: 0 };
    console.warn('Pricing calculation error:', error.message);
  }

  // Conversion rate: 1 JOD = 1.41 USD
  const convertPrice = (priceJOD) => {
    return currency === "USD" ? (priceJOD * 1.41).toFixed(2) : priceJOD;
  };

  const currencySymbol = currency === "USD" ? "$" : "JOD";

  // Validate form before showing Turnstile
  const validateForm = async () => {
    const { toast } = await import('react-toastify');
    const { name, email, phone, license, street, city, country, area, postalCode, idDocument, passportDocument } = bookingData.customerInfo;

    // Validate dates first
    if (!bookingData.pickupDate || !bookingData.returnDate) {
      toast.error(language === 'ar'
        ? 'يرجى تحديد تواريخ الاستلام والإرجاع'
        : 'Please select pickup and return dates');
      return false;
    }

    // Validate pickup/return locations
    if (!bookingData.pickupLocation || !bookingData.returnLocation) {
      toast.error(language === 'ar'
        ? 'يرجى تحديد مواقع الاستلام والإرجاع'
        : 'Please select pickup and return locations');
      return false;
    }

    // Validate days
    if (!bookingData.days || bookingData.days < 1) {
      toast.error(language === 'ar'
        ? 'تاريخ الإرجاع يجب أن يكون بعد تاريخ الاستلام'
        : 'Return date must be after pickup date');
      return false;
    }

    // Check age confirmation
    if (!bookingData.ageConfirmed) {
      toast.error(language === 'ar'
        ? 'يرجى تأكيد أن عمرك 23 عامًا أو أكثر'
        : 'Please confirm that you are 23 years or older');
      return false;
    }

    // Validate insurance selected
    if (!bookingData.insurance) {
      toast.error(language === 'ar'
        ? 'يرجى اختيار نوع التأمين'
        : 'Please select an insurance option');
      return false;
    }

    // Validate using Yup schema
    try {
      const { getBookingSchema } = await import('../utils/validationSchemas');
      const schema = getBookingSchema(language);

      // Prepare data for validation
      const dataToValidate = {
        name,
        email,
        phone,
        license,
        street,
        city,
        area: area || '',
        postalCode: postalCode || '',
        country,
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        insurance: bookingData.insurance,
        idDocument,
        passportDocument
      };

      await schema.validate(dataToValidate, { abortEarly: false });

      // If validation passes
      setFormValidated(true);
      toast.success(language === 'ar'
        ? 'تم التحقق من النموذج بنجاح! يرجى إكمال التحقق الأمني.'
        : 'Form validated successfully! Please complete security verification.', {
        autoClose: 3000
      });

      // Scroll to Turnstile section
      setTimeout(() => {
        document.getElementById('turnstile-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);

      return true;
    } catch (validationError) {
      if (validationError.inner && validationError.inner.length > 0) {
        // Show first error
        toast.error(validationError.inner[0].message, { autoClose: 5000 });
      } else {
        toast.error(validationError.message, { autoClose: 5000 });
      }
      return false;
    }
  };

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
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <img
              src={getCarImage(car.car_barnd, car.car_type, car.image_url)}
              alt={`${car.car_barnd} ${car.car_type} ${car.car_model} available for rent - Al-Fakhama Car Rental Jordan`}
              className="w-full h-64 object-cover"
              loading="eager"
              width="800"
              height="256"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{car.car_barnd} {car.car_type}</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-gray-600">{t('model')}:</span>
                  <span className="ml-2 font-semibold">{car.car_model}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('color')}:</span>
                  <span className="ml-2 font-semibold">{t(car.car_color)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 border-2 border-blue-200 shadow-md">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">{t('perDay')}</p>
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-1">
                    {currencySymbol} {convertPrice(car.price_per_day)}
                  </div>
                  <p className="text-xs text-gray-500 italic">{language === 'ar' ? 'السعر اليومي' : 'Daily Rate'}</p>
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
                      const newPickupDate = e.target.value;
                      if (bookingData.returnDate) {
                        const days = Math.ceil((new Date(bookingData.returnDate) - new Date(newPickupDate)) / (1000 * 60 * 60 * 24));
                        setBookingData({ ...bookingData, pickupDate: newPickupDate, days: Math.max(1, days) });
                      } else {
                        setBookingData({ ...bookingData, pickupDate: newPickupDate });
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
                      const newReturnDate = e.target.value;
                      if (bookingData.pickupDate) {
                        const days = Math.ceil((new Date(newReturnDate) - new Date(bookingData.pickupDate)) / (1000 * 60 * 60 * 24));
                        setBookingData({ ...bookingData, returnDate: newReturnDate, days: Math.max(1, days) });
                      } else {
                        setBookingData({ ...bookingData, returnDate: newReturnDate });
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                    min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Pickup and Return Location */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="inline-block w-4 h-4 mr-1" />
                    {language === 'ar' ? 'موقع الاستلام *' : 'Pickup Location *'}
                  </label>
                  <select
                    value={bookingData.pickupLocation || ''}
                    onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">
                      {language === 'ar' ? 'اختر موقع الاستلام' : 'Select Pickup Location'}
                    </option>
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="inline-block w-4 h-4 mr-1" />
                    {language === 'ar' ? 'موقع الإرجاع *' : 'Return Location *'}
                  </label>
                  <select
                    value={bookingData.returnLocation || ''}
                    onChange={(e) => setBookingData({ ...bookingData, returnLocation: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">
                      {language === 'ar' ? 'اختر موقع الإرجاع' : 'Select Return Location'}
                    </option>
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
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
                  { id: 'basic', name: 'Basic Insurance', priceJOD: 0, desc: '600 JOD deductible' },
                  { id: 'cdw', name: 'CDW Insurance', priceJOD: 15, desc: '300 JOD deductible' },
                  { id: 'full', name: 'Full Insurance', priceJOD: 35, desc: 'No Liability!' }
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
                {/* Regular Services */}
                {[
                  { id: 'phone', name: t('mobilePhone'), icon: Phone },
                  { id: 'wifi', name: t('wifi'), icon: Wifi },
                  { id: 'gps', name: t('gps'), icon: MapPin },
                  { id: 'childSeat', name: t('childSeat'), icon: Shield }
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
                    <span>{service.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">
                {language === 'ar' ? 'المستندات المطلوبة *' : 'Required Documents *'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {language === 'ar'
                  ? 'يرجى تحميل صور واضحة لجواز السفر/الهوية الوطنية ورخصة القيادة'
                  : 'Please upload clear photos of your Passport/National ID and Driver\'s License'}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'صورة جواز السفر / الهوية الوطنية *' : 'Passport / National ID Photo *'}
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
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
                    {language === 'ar' ? 'صورة رخصة القيادة *' : 'Driver\'s License Photo *'}
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
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
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          {/* Age Verification Checkbox */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bookingData.ageConfirmed || false}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  ageConfirmed: e.target.checked
                })}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={formValidated}
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">
                  {language === 'ar'
                    ? 'أؤكد أن عمري 23 عامًا أو أكثر *'
                    : 'I confirm that I am 23 years or older *'}
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'ar'
                    ? 'يجب أن يكون عمر السائق 23 عامًا على الأقل لاستئجار سيارة'
                    : 'Driver must be at least 23 years old to rent a vehicle'}
                </p>
              </div>
            </label>
          </div>

          {/* Pricing Summary */}
          <h3 className="text-xl font-bold mb-4">{t('totalPrice')}</h3>
          <div className="space-y-2 mb-6">
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

          {/* Step 1: Validate Form Button (shown before validation) */}
          {!formValidated && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  {language === 'ar'
                    ? 'انقر على "التحقق من النموذج" للتأكد من صحة جميع المعلومات قبل المتابعة'
                    : 'Click "Validate Form" to verify all information is correct before proceeding'}
                </p>
              </div>
              <button
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

          {/* Step 2: Cloudflare Turnstile - Security Verification (shown after validation) */}
          {formValidated && (
            <>
              <div id="turnstile-section" className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    {language === 'ar'
                      ? 'تم التحقق من النموذج بنجاح! '
                      : 'Form validated successfully! '}
                    <button
                      onClick={() => {
                        setFormValidated(false);
                        setTurnstileToken('');
                        setTurnstileError(false);
                      }}
                      className="text-green-900 underline hover:text-green-700 font-medium"
                    >
                      {language === 'ar' ? 'تعديل البيانات' : 'Edit Form'}
                    </button>
                  </p>
                </div>

                {turnstileSiteKey ? (
                  <>
                    <h3 className="text-lg font-semibold mb-3">
                      {language === 'ar' ? 'التحقق الأمني *' : 'Security Verification *'}
                    </h3>
                    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                      {turnstileError ? (
                        <div className="w-full text-center">
                          <p className="text-red-600 mb-3">
                            {language === 'ar'
                              ? 'حدث خطأ في التحقق. انقر للمحاولة مرة أخرى.'
                              : 'Verification error. Click to try again.'}
                          </p>
                          <button
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
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          {language === 'ar' ? 'تم التحقق بنجاح' : 'Verified successfully'}
                        </p>
                      )}
                    </div>
                  </>
                ) : null}

                {/* Step 3: Submit Button (shown after Turnstile verification OR if no Turnstile) */}
                {(!turnstileSiteKey || turnstileToken) && (
                  <button
                    onClick={async () => {
                      // Store token for server verification
                      if (turnstileToken) {
                        window.turnstileToken = turnstileToken;
                      }
                      handleBookingSubmit();
                    }}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-900 to-slate-600 text-white py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                    {isSubmitting ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : t('confirmBooking')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;