import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react'; // or your icon library

const ChatBot = ({language}) => {
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const t = (key) => {
    const translations = {
      ar: {
        // ... your Arabic translations
        chatTitle: 'مساعد الحجز',
        chatPlaceholder: 'اسأل عن السيارات أو خدمات',
      },
      en: {
        // ... your English translations
        chatTitle: 'Booking Assistant',
        chatPlaceholder: 'Ask about cars or booking services',
      }
    };
    return translations[language][key] || key;
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
      } 
      // ... rest of your bot logic
      else {
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
    /* Main ChatBot Container - Fixed positioning for bottom corner */
    <div className={`fixed bottom-5 ${language === 'ar' ? 'left-4' : 'right-4'} z-50`}>
      {chatOpen && (
        /* Chat Window Container - White background with shadow */
        <div className="bg-white rounded-lg shadow-xl w-64 h- 96 mb-4 border-2 border-blue-200" >
          {/* Chat Header - Blue gradient with title and close button */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-600 text-white px-3 py-1 rounded-t-lg flex justify-between items-center ">
            <h3 className="font-bold">{t('chatTitle')}</h3>
            <button
              onClick={() => setChatOpen(false) }
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages Area - Scrollable container for messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3" id="chat-messages">
            {chatMessages.length === 0 && (
              /* Welcome Message - Shows when no messages */
              <div className="bg-gray-100 p-3 rounded-lg">
                {language === 'ar' ?
                  'مرحباً! كيف يمكنني مساعدتك في حجز السيارة المناسبة؟ يمكنك سؤالي عن الأسعار، التأمين، أو السيارات المتاحة.' :
                  'Hello! How can I help you book the right car? You can ask me about prices, insurance, or available cars.'
                }
              </div>
            )}

            {chatMessages.map((message, index) => (
              /* Individual Message - User or bot message bubble */
              <div key={index} className={`p-3 rounded-lg ${message.type === 'user'
                  ? `bg-blue-500 text-white ${language === 'ar' ? 'mr-4' : 'ml-4'}`
                  : `bg-gray-100 ${language === 'ar' ? 'ml-4' : 'mr-4'}`
                }`}>
                {message.text}
              </div>
            ))}
          </div>

          {/* Chat Input Area - Input field and send button */}
          <div className="p-2 border-t">
            {/* Input Container - Flex layout for input and button */}
            <div className={`flex py-0.5 gap-1 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
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
                className="flex-1 p-2 border-solid border-1 border-blue-100 rounded-lg text-sm focus:outline-none"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
              {/* Send Button - Arrow button to send message */}
              <button
                onClick={() => {
                  if (chatInput.trim()) {
                    handleChatMessage(chatInput.trim());
                    setChatInput('');
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

      {!chatOpen && (
        /* Chat Toggle Button - Floating chat icon when chat is closed */
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-gradient-to-r from-blue-900 to-slate-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all animate-pulse"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default ChatBot;