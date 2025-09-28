import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from '../utils/translations';
import carsData from '../data/cars.json';

const ChatBot = ({ language }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const t = useTranslation(language);

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

  return (
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
};

export default ChatBot;