import React, { useState } from "react";
import { MessageCircle, ArrowRight, ArrowLeft, X } from "lucide-react";
import { useApp } from "../context/AppContext";

const ChatBot = () => {
  const { language } = useApp();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const t = (key) => {
    const translations = {
      ar: {
        // ... your Arabic translations
        chatTitle: "مساعد الحجز",
        chatPlaceholder: "اسأل عن السيارات أو خدمات",
      },
      en: {
        // ... your English translations
        chatTitle: "Booking Assistant",
        chatPlaceholder: "Ask about cars or bookng services",
      },
    };
    return translations[language][key] || key;
  };

  const handleChatMessage = (message) => {
    const userMessage = { type: "user", text: message };
    setChatMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      let botResponse = "";
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes("price") ||
        lowerMessage.includes("سعر") ||
        lowerMessage.includes("cost") ||
        lowerMessage.includes("كلفة")
      ) {
        botResponse =
          language === "ar"
            ? "أسعار السيارات تبدأ من 20$ في اليوم للسيارات الاقتصادية و تصل إلى 70$ للسيارات الفاخرة والفانات. هل تريد معرفة سعر سيارة محددة؟"
            : "Car prices start from $20 per day for economy cars and go up to $70 for luxury vehicles and vans. Would you like to know the price of a specific car?";
      }
      // ... rest of your bot logic
      else {
        const greetings = ["hello", "hi", "مرحبا", "السلام", "أهلا", "hey"];
        if (greetings.some((greeting) => lowerMessage.includes(greeting))) {
          botResponse =
            language === "ar"
              ? "أهلاً وسهلاً! أنا مساعدك الشخصي لتأجير السيارات. يمكنني مساعدتك في: الأسعار، أنواع السيارات، التأمين، طريقة الحجز، أو الإجابة على أي سؤال آخر."
              : "Hello and welcome! I am your personal car rental assistant. I can help you with: prices, car types, insurance, booking process, or answer any other questions.";
        } else {
          botResponse =
            language === "ar"
              ? "عذراً، لم أفهم سؤالك بوضوح. يمكنك سؤالي عن: الأسعار، السيارات المتاحة، التأمين، طريقة الحجز، الموقع، أو الخدمات الإضافية."
              : "Sorry, I did not understand your question clearly. You can ask me about: prices, available cars, insurance, booking process, location, or additional services.";
        }
      }

      setChatMessages((prev) => [...prev, { type: "bot", text: botResponse }]);

      // Auto scroll to bottom after bot response
      setTimeout(() => {
        const chatContainer = document.getElementById("chat-messages");
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }, 800);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setChatOpen(false);
      setIsClosing(false);
    }, 200); // Match the fadeSlideDown duration
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeSlideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(10px);
            opacity: 0;
          }
        }
      `}</style>
      {/* Main ChatBot Container */}
      <div
        className={`fixed bottom-5 ${
          language === "ar" ? "left-4" : "right-4"
        } z-50`}
      >
        {(chatOpen || isClosing) && (
          /* Chat Window Container */
          <div
            className={`bg-white rounded-lg shadow-xl w-64 h-[23.25rem] mb-4 border-2 border-blue-100 transform transition-all duration-500 ease-out ${
              chatOpen
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-8 opacity-0 scale-95"
            }`}
            style={{
              animation: isClosing
                ? "fadeSlideDown 0.2s ease-in"
                : "fadeSlideUp 0.25s ease-out",
            }}
          >
            {/* Chat Header */}
            <div
              className={`bg-gradient-to-r from-blue-900 to-slate-600 text-white px-3 py-1 rounded-t-lg flex justify-between items-center ${
                language === "ar" ? "pl-0" : "pr-0"
              }`}
            >
              <h3 className="font-bold">{t("chatTitle")}</h3>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 px-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chat Messages Area*/}
            <div
              className="font-serif h-64 overflow-y-auto p-4 space-y-3"
              id="chat-messages"
            >
              {chatMessages.length === 0 && (
                /* Welcome Message */
                <div className=" bg-gray-300 p-3 rounded-lg bg-gray-300 text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-2xl ">
                  {language === "ar"
                    ? "مرحباً! كيف يمكنني مساعدتك في حجز السيارة المناسبة؟ يمكنك سؤالي عن الأسعار، التأمين، أو السيارات المتاحة."
                    : "Hello! How can I help you book the right car? You can ask me about prices, insurance, or available cars."}
                </div>
              )}

              {chatMessages.map((message, index) => (
                /* Individual Message */
                <div
                  key={index}
                  className={`flex ${
                    message.type === "user"
                      ? language === "ar"
                        ? "justify-start"
                        : "justify-end"
                      : language === "ar"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 ${
                      message.type === "user"
                        ? "bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm"
                        : "bg-gray-300 text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-2xl"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Area */}
            <div className="px-1 py-2 border-0 ">
              {/* Input Container */}
              <div
                className={`flex py-0.5 gap-1 ${
                  language === "ar" ? "space-x-reverse" : ""
                }`}
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && chatInput.trim()) {
                      handleChatMessage(chatInput.trim());
                      setChatInput("");
                    }
                  }}
                  placeholder={t("chatPlaceholder")}
                  className="flex-1 p-2 border-solid border-1 border-blue-100 rounded-lg text-sm focus:outline-none"
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
                {/* Send Button */}
                <button
                  onClick={() => {
                    if (chatInput.trim()) {
                      handleChatMessage(chatInput.trim());
                      setChatInput("");
                      setTimeout(() => {
                        const chatContainer =
                          document.getElementById("chat-messages");
                        if (chatContainer) {
                          chatContainer.scrollTop = chatContainer.scrollHeight;
                        }
                      }, 100);
                    }
                  }}
                  className="bg-blue-500 text-2xl text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={!chatInput.trim()}
                >
                  {language === "ar" ? (
                    <ArrowLeft size={20} />
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {!chatOpen && (
          /* Chat Toggle Button */
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="bg-gradient-to-r from-blue-900 to-slate-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all animate-pulse"
          >
            <MessageCircle size={24} />
          </button>
        )}
      </div>
    </>
  );
};

export default ChatBot;
