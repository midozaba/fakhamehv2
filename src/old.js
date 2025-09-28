import React, { useState} from 'react';
import { Search, Calendar, MapPin, Phone, Mail, MessageCircle, Car, Shield, Wifi, Clock, Users, Fuel, ChevronLeft, ChevronRight, Star, Check } from 'lucide-react';
import carsData from './data/cars.json';


const App = () => {
  const [language, setLanguage] = useState('ar');
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCar, setSelectedCar] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    category: 'all',
    priceRange: 'all'
  });
  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    returnDate: '',
    days: 1,
    insurance: '',
    additionalServices: [],
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      license: ''
    }
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const t = (key) => {
    const translations = {
      ar: {
        // Header
        home: 'الرئيسية',
        cars: 'السيارات',
        about: 'من نحن',
        contact: 'اتصل بنا',

        // Hero Section
        heroTitle: 'الفخامة لتأجير السيارات',
        heroSubtitle: 'اكتشف أفضل خدمات تأجير السيارات في الأردن',
        searchCars: 'ابحث عن السيارات',
        bookNow: 'احجز الآن',

        // Categories
        economy: 'اقتصادية',
        sedan: 'سيدان',
        suv: 'SUV',
        van: 'فان',
        luxury: 'فاخرة',
        compact: 'صغيرة',

        // Car Details
        perDay: 'في اليوم',
        perWeek: 'في الأسبوع',
        perMonth: 'في الشهر',
        model: 'الموديل',
        color: 'اللون',
        available: 'متاح',
        unavailable: 'غير متاح',

        // Booking
        selectDates: 'اختر التواريخ',
        pickupDate: 'تاريخ الاستلام',
        returnDate: 'تاريخ الإرجاع',
        totalDays: 'إجمالي الأيام',

        // Insurance
        insurance: 'التأمين',
        basicInsurance: 'تأمين أساسي',
        fullInsurance: 'تأمين شامل',
        premiumInsurance: 'تأمين بريميوم',

        // Additional Services
        additionalServices: 'خدمات إضافية',
        mobilePhone: 'هاتف نقال',
        wifi: 'إنترنت واي فاي',
        gps: 'جهاز GPS',
        childSeat: 'مقعد أطفال',

        // Customer Info
        customerInfo: 'بيانات العميل',
        fullName: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        licenseNumber: 'رقم الرخصة',

        // Pricing
        basePrice: 'السعر الأساسي',
        insurancePrice: 'سعر التأمين',
        servicesPrice: 'سعر الخدمات',
        totalPrice: 'الإجمالي',

        // Actions
        viewDetails: 'عرض التفاصيل',
        confirmBooking: 'تأكيد الحجز',
        backToHome: 'العودة للرئيسية',

        // Chat
        chatTitle: 'مساعد الحجز',
        chatPlaceholder: 'اسأل عن السيارات أو خدمات الحجز...',
        sendMessage: 'إرسال',
        orSimilar: 'أو مشابه',

        // Footer
        aboutUs: 'نحن شركة الفخامة لتأجير السيارات، نقدم أفضل خدمات التأجير في الأردن',
        followUs: 'تابعنا',

        // Messages
        bookingSuccess: 'تم إرسال طلب الحجز بنجاح! سيتم التواصل معك قريباً.',
        fillAllFields: 'يرجى ملء جميع الحقول المطلوبة',

        // Colors
        white: 'أبيض',
        black: 'أسود',
        gray: 'رمادي',
        red: 'أحمر',
        blue: 'أزرق',
        silver: 'فضي',
        'Silver Metallic': 'فضي معدني',
        'Metallic Gray': 'رمادي معدني',
        'Navy Blue': 'أزرق نيلي',
        'Blue Metallic': 'أزرق معدني',
        'Burgundy': 'بورغندي',
        'Pearl': 'لؤلؤي',
        'Brown': 'بني',
        'Navy': 'نيلي'
      },
      en: {
        // Header
        home: 'Home',
        cars: 'Cars',
        about: 'About',
        contact: 'Contact',

        // Hero Section
        heroTitle: 'Al Fakhama Car Rental',
        heroSubtitle: 'Discover the best car rental services in Jordan',
        searchCars: 'Search Cars',
        bookNow: 'Book Now',

        // Categories
        economy: 'Economy',
        sedan: 'Sedan',
        suv: 'SUV',
        van: 'Van',
        luxury: 'Luxury',
        compact: 'Compact',

        // Car Details
        perDay: 'per day',
        perWeek: 'per week',
        perMonth: 'per month',
        model: 'Model',
        color: 'Color',
        available: 'Available',
        unavailable: 'Unavailable',

        // Booking
        selectDates: 'Select Dates',
        pickupDate: 'Pickup Date',
        returnDate: 'Return Date',
        totalDays: 'Total Days',

        // Insurance
        insurance: 'Insurance',
        basicInsurance: 'Basic Insurance',
        fullInsurance: 'Full Insurance',
        premiumInsurance: 'Premium Insurance',

        // Additional Services
        additionalServices: 'Additional Services',
        mobilePhone: 'Mobile Phone',
        wifi: 'WiFi Internet',
        gps: 'GPS Device',
        childSeat: 'Child Seat',

        // Customer Info
        customerInfo: 'Customer Information',
        fullName: 'Full Name',
        email: 'Email',
        phone: 'Phone Number',
        licenseNumber: 'License Number',

        // Pricing
        basePrice: 'Base Price',
        insurancePrice: 'Insurance Price',
        servicesPrice: 'Services Price',
        totalPrice: 'Total',

        // Actions
        viewDetails: 'View Details',
        confirmBooking: 'Confirm Booking',
        backToHome: 'Back to Home',

        // Chat
        chatTitle: 'Booking Assistant',
        chatPlaceholder: 'Ask about cars or booking services...',
        sendMessage: 'Send',
        orSimilar: 'or similar',

        // Footer
        aboutUs: 'We are Al Fakhama Car Rental, providing the best rental services in Jordan',
        followUs: 'Follow Us',

        // Messages
        bookingSuccess: 'Booking request sent successfully! We will contact you soon.',
        fillAllFields: 'Please fill in all required fields',

        // Colors
        white: 'White',
        black: 'Black',
        gray: 'Gray',
        red: 'Red',
        blue: 'Blue',
        silver: 'Silver',
        'Silver Metallic': 'Silver Metallic',
        'Metallic Gray': 'Metallic Gray',
        'Navy Blue': 'Navy Blue',
        'Blue Metallic': 'Blue Metallic',
        'Burgundy': 'Burgundy',
        'Pearl': 'Pearl',
        'Brown': 'Brown',
        'Navy': 'Navy'
      }
    };
    return translations[language][key] || key;
  };

  const categorizeCarType = (carType) => {
    const type = carType.toLowerCase();
    if (['i10', 'picanto', 'pegas'].includes(type)) return 'economy';
    if (['elantra', 'cerato', 'corolla', 'fusion'].includes(type)) return 'sedan';
    if (['seltos', 'sonet', 'captiva'].includes(type)) return 'suv';
    if (['h1'].includes(type)) return 'van';
    if (['camry', 'sonata'].includes(type)) return 'luxury';
    return 'compact';
  };

  const getCarImage = (brand, type) => {
    const carImages = {
      'ford-fusion': 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop',
      'hyundai-i10': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop',
      'hyundai-accent': 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=250&fit=crop',
      'hyundai-elantra': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop',
      'hyundai-h1': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=250&fit=crop',
      'hyundai-sonata': 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&h=250&fit=crop',
      'kia-cerato': 'https://images.unsplash.com/photo-1619976215249-ebd9c6c39409?w=400&h=250&fit=crop',
      'kia-seltos': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop',
      'kia-sonet': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&h=250&fit=crop',
      'kia-pegas': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop',
      'kia-picanto': 'https://images.unsplash.com/photo-1580414050984-1a75c34bd1fb?w=400&h=250&fit=crop',
      'toyota-camry': 'https://images.unsplash.com/photo-1563720223-b9a09ba4a3b8?w=400&h=250&fit=crop',
      'toyota-corolla': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=250&fit=crop',
      'chevrolet-captiva': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=250&fit=crop',
      'default': 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop'
    };

    const key = `${brand.toLowerCase()}-${type.toLowerCase()}`;
    return carImages[key] || carImages.default;
  };

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

  const calculatePrice = () => {
    if (!selectedCar) return 0;

    let basePrice = selectedCar.PRICEPERDAY * bookingData.days;
    let insurancePrice = 0;
    let servicesPrice = 0;

    if (bookingData.insurance === 'basic') insurancePrice = 5 * bookingData.days;
    else if (bookingData.insurance === 'full') insurancePrice = 10 * bookingData.days;
    else if (bookingData.insurance === 'premium') insurancePrice = 15 * bookingData.days;

    bookingData.additionalServices.forEach(service => {
      if (service === 'phone') servicesPrice += 3 * bookingData.days;
      else if (service === 'wifi') servicesPrice += 2 * bookingData.days;
      else if (service === 'gps') servicesPrice += 2 * bookingData.days;
      else if (service === 'childSeat') servicesPrice += 1 * bookingData.days;
    });

    return { basePrice, insurancePrice, servicesPrice, total: basePrice + insurancePrice + servicesPrice };
  };

  const handleBookingSubmit = () => {
    const { name, email, phone, license } = bookingData.customerInfo;
    if (!name || !email || !phone || !license || !bookingData.pickupDate || !bookingData.returnDate) {
      alert(t('fillAllFields'));
      return;
    }

    console.log('Booking Data:', {
      car: selectedCar,
      booking: bookingData,
      pricing: calculatePrice()
    });

    alert(t('bookingSuccess'));
    setCurrentPage('home');
    setSelectedCar(null);
  };

  const handleChatMessage = (message) => {
    const userMessage = { type: 'user', text: message };
    setChatMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      let botResponse = '';
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('price') || lowerMessage.includes('سعر') || lowerMessage.includes('cost') || lowerMessage.includes('كلفة')) {
        botResponse = language === 'ar'
          ? 'أسعار السيارات تبدأ من 20$ في اليوم للسيارات الاقتصادية و تصل إلى 70$ للسيارات الفاخرة والفانات. هل تريد معرفة سعر سيارة محددة؟'
          : 'Car prices start from $20 per day for economy cars and go up to $70 for luxury vehicles and vans. Would you like to know the price of a specific car?';
      } else if (lowerMessage.includes('insurance') || lowerMessage.includes('تأمين')) {
        botResponse = language === 'ar'
          ? 'نوفر ثلاثة أنواع من التأمين: أساسي (5$/يوم)، شامل (10$/يوم)، وبريميوم (15$/يوم) مع دعم 24/7. أيهم تفضل؟'
          : 'We offer three types of insurance: Basic ($5/day), Full ($10/day), and Premium ($15/day) with 24/7 support. Which one do you prefer?';
      } else if (lowerMessage.includes('booking') || lowerMessage.includes('حجز') || lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
        botResponse = language === 'ar'
          ? 'لحجز سيارة: 1) اختر السيارة المناسبة، 2) اضغط "احجز الآن"، 3) حدد التواريخ، 4) اختر التأمين والخدمات الإضافية، 5) أدخل بياناتك الشخصية.'
          : 'To book a car: 1) Choose your preferred car, 2) Click "Book Now", 3) Select dates, 4) Choose insurance and additional services, 5) Enter your personal information.';
      } else if (lowerMessage.includes('available') || lowerMessage.includes('متاح') || lowerMessage.includes('cars') || lowerMessage.includes('سيارات')) {
        const availableCars = carsData.filter(car => car.status === 'available').length;
        botResponse = language === 'ar'
          ? `لدينا ${availableCars} سيارة متاحة حالياً من مختلف الفئات: اقتصادية، سيدان، SUV، فان، وفاخرة. هل تبحث عن فئة معينة؟`
          : `We currently have ${availableCars} cars available across different categories: Economy, Sedan, SUV, Van, and Luxury. Are you looking for a specific category?`;
      } else if (lowerMessage.includes('location') || lowerMessage.includes('موقع') || lowerMessage.includes('address') || lowerMessage.includes('عنوان')) {
        botResponse = language === 'ar'
          ? 'نقع في عمان، الأردن. يمكننا توصيل السيارة إليك أو يمكنك استلامها من مكتبنا. خدمة التوصيل متاحة داخل عمان.'
          : 'We are located in Amman, Jordan. We can deliver the car to you or you can pick it up from our office. Delivery service is available within Amman.';
      } else if (lowerMessage.includes('contact') || lowerMessage.includes('اتصال') || lowerMessage.includes('phone') || lowerMessage.includes('هاتف')) {
        botResponse = language === 'ar'
          ? 'يمكنك التواصل معنا على: 📞 هاتف: +962 79 123 4567 | 📧 إيميل: info@alfakhama.com | ⏰ ساعات العمل: 8 صباحاً - 10 مساءً'
          : 'You can contact us at: 📞 Phone: +962 79 123 4567 | 📧 Email: info@alfakhama.com | ⏰ Working hours: 8 AM - 10 PM';
      } else if (lowerMessage.includes('services') || lowerMessage.includes('خدمات') || lowerMessage.includes('additional') || lowerMessage.includes('إضافية')) {
        botResponse = language === 'ar'
          ? 'خدماتنا الإضافية: 📱 هاتف نقال (3$/يوم)، 🌐 واي فاي (2$/يوم)، 🗺️ GPS (2$/يوم)، 👶 مقعد أطفال (1$/يوم). جميع الخدمات اختيارية.'
          : 'Our additional services: 📱 Mobile phone ($3/day), 🌐 WiFi ($2/day), 🗺️ GPS ($2/day), 👶 Child seat ($1/day). All services are optional.';
      } else if (lowerMessage.includes('requirements') || lowerMessage.includes('متطلبات') || lowerMessage.includes('documents') || lowerMessage.includes('وثائق')) {
        botResponse = language === 'ar'
          ? 'للحجز تحتاج: 1) رخصة قيادة سارية، 2) هوية شخصية أو جواز سفر، 3) بطاقة ائتمانية، 4) عمر 21 سنة فما فوق. للأجانب: رخصة دولية مطلوبة.'
          : 'For booking you need: 1) Valid driving license, 2) ID or passport, 3) Credit card, 4) Age 21 or above. For foreigners: International driving license required.';
      } else {
        const greetings = ['hello', 'hi', 'مرحبا', 'السلام', 'أهلا', 'hey'];
        if (greetings.some(greeting => lowerMessage.includes(greeting))) {
          botResponse = language === 'ar'
            ? 'أهلاً وسهلاً! أنا مساعدك الشخصي لتأجير السيارات. يمكنني مساعدتك في: الأسعار، أنواع السيارات، التأمين، طريقة الحجز، أو الإجابة على أي سؤال آخر.'
            : 'Hello and welcome! I am your personal car rental assistant. I can help you with: prices, car types, insurance, booking process, or answer any other questions.';
        } else {
          botResponse = language === 'ar'
            ? 'عذراً، لم أفهم سؤالك بوضوح. يمكنك سؤالي عن: الأسعار، السيارات المتاحة، التأمين، طريقة الحجز، الموقع، أو الخدمات الإضافية.'
            : 'Sorry, I did not understand your question clearly. You can ask me about: prices, available cars, insurance, booking process, location, or additional services.';
        }
      }

      setChatMessages(prev => [...prev, { type: 'bot', text: botResponse }]);

      // Auto scroll to bottom after bot response
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }, 800);
  };

  const ChatBot = () => (
    <div className={`fixed bottom-4 ${language === 'ar' ? 'left-4' : 'right-4'} z-50`}>
      {chatOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 mb-4 border-2 border-blue-200">
          <div className="bg-gradient-to-r from-blue-900 to-slate-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">{t('chatTitle')}</h3>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="h-64 overflow-y-auto p-4 space-y-3" id="chat-messages">
            {chatMessages.length === 0 && (
              <div className="bg-gray-100 p-3 rounded-lg">
                {language === 'ar' ?
                  'مرحباً! كيف يمكنني مساعدتك في حجز السيارة المناسبة؟ يمكنك سؤالي عن الأسعار، التأمين، أو السيارات المتاحة.' :
                  'Hello! How can I help you book the right car? You can ask me about prices, insurance, or available cars.'
                }
              </div>
            )}

            {chatMessages.map((message, index) => (
              <div key={index} className={`p-3 rounded-lg ${message.type === 'user'
                  ? `bg-blue-500 text-white ${language === 'ar' ? 'mr-4' : 'ml-4'}`
                  : `bg-gray-100 ${language === 'ar' ? 'ml-4' : 'mr-4'}`
                }`}>
                {message.text}
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className={`flex ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    handleChatMessage(chatInput.trim());
                    setChatInput('');
                  }
                }}
                placeholder={t('chatPlaceholder')}
                className="flex-1 p-2 border rounded-lg text-sm"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
              <button
                onClick={() => {
                  if (chatInput.trim()) {
                    handleChatMessage(chatInput.trim());
                    setChatInput('');
                    // Auto scroll to bottom
                    setTimeout(() => {
                      const chatContainer = document.getElementById('chat-messages');
                      if (chatContainer) {
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                      }
                    }, 100);
                  }
                }}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                disabled={!chatInput.trim()}
              >
                {language === 'ar' ? '←' : '→'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="bg-gradient-to-r from-blue-900 to-slate-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all animate-pulse"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );

  const Header = () => (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-slate-400 to-blue-900 p-3 rounded-lg">
              <Car className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">AL FAKHAMA</h1>
              <p className="text-slate-600 text-sm">car rental</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-6">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-lg transition-all ${currentPage === 'home' ? 'bg-blue-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {t('home')}
            </button>
            <button
              onClick={() => setCurrentPage('cars')}
              className={`px-4 py-2 rounded-lg transition-all ${currentPage === 'cars' ? 'bg-blue-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {t('cars')}
            </button>
          </nav>

          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="bg-gradient-to-r from-slate-400 to-blue-900 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </header>
  );

  const HomePage = () => (
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

  const CarsPage = () => (
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
                <option value="low">$15-25 per day</option>
                <option value="medium">$26-40 per day</option>
                <option value="high">$41+ per day</option>
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
                    ${car.PRICEPERDAY} <span className="text-sm text-gray-500">{t('perDay')}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ${car.priceperweek} {t('perWeek')} • ${car.pricepermonth} {t('perMonth')}
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

  const BookingPage = () => {
    const pricing = calculatePrice();

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
                      <span className="font-bold">${selectedCar.PRICEPERDAY}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('perWeek')}:</span>
                      <span className="font-bold">${selectedCar.priceperweek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('perMonth')}:</span>
                      <span className="font-bold">${selectedCar.pricepermonth}</span>
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
                    { id: 'basic', name: t('basicInsurance'), price: 5, desc: 'Basic coverage for accidents' },
                    { id: 'full', name: t('fullInsurance'), price: 10, desc: 'Comprehensive coverage' },
                    { id: 'premium', name: t('premiumInsurance'), price: 15, desc: 'Premium coverage with 24/7 support' }
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
                          <span className="text-blue-900 font-bold">${insurance.price}/day</span>
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
                    { id: 'phone', name: t('mobilePhone'), price: 3, icon: Phone },
                    { id: 'wifi', name: t('wifi'), price: 2, icon: Wifi },
                    { id: 'gps', name: t('gps'), price: 2, icon: MapPin },
                    { id: 'childSeat', name: t('childSeat'), price: 1, icon: Shield }
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
                        <span className="text-blue-900 font-bold">${service.price}/day</span>
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
                    <span>${pricing.basePrice}</span>
                  </div>
                  {pricing.insurancePrice > 0 && (
                    <div className="flex justify-between">
                      <span>{t('insurancePrice')}:</span>
                      <span>${pricing.insurancePrice}</span>
                    </div>
                  )}
                  {pricing.servicesPrice > 0 && (
                    <div className="flex justify-between">
                      <span>{t('servicesPrice')}:</span>
                      <span>${pricing.servicesPrice}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-xl font-bold text-blue-900">
                      <span>{t('totalPrice')}:</span>
                      <span>${pricing.total}</span>
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

  const Footer = () => (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gradient-to-br from-slate-400 to-blue-900 p-3 rounded-lg">
                <Car className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">AL FAKHAMA</h3>
                <p className="text-gray-400">car rental</p>
              </div>
            </div>
            <p className="text-gray-400">{t('aboutUs')}</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-slate-400" />
                <span>+962 79 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-slate-400" />
                <span>info@alfakhama.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-slate-400" />
                <span>Amman, Jordan</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('followUs')}</h4>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 cursor-pointer">
                <span className="text-white font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-300 cursor-pointer">
                <span className="text-white font-bold">t</span>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 cursor-pointer">
                <span className="text-white font-bold">ig</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2024 Al Fakhama Car Rental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />

      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'cars' && <CarsPage />}
        {currentPage === 'booking' && selectedCar && <BookingPage />}
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default App;