import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Phone, Mail, MessageCircle } from 'lucide-react';
import { useTranslation } from '../utils/translations';
import { useApp } from '../context/AppContext';
import SEO from './common/SEO';
import { getFAQSchema } from '../utils/structuredData';

const FAQ = () => {
  const { language } = useApp();
  const t = useTranslation(language);
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef([]);

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  useEffect(() => {
    const observers = [];
    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleSections((prev) => new Set([...prev, index]));
              }
            });
          },
          { threshold: 0.1 }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const faqs = language === 'ar' ? [
    {
      category: 'الحجز والأسعار',
      questions: [
        {
          question: 'كيف يمكنني حجز سيارة؟',
          answer: 'يمكنك حجز سيارة عبر موقعنا الإلكتروني بسهولة. اختر السيارة المناسبة، حدد تواريخ الاستئجار، املأ معلوماتك، وأرسل الطلب. سنتواصل معك خلال 24 ساعة لتأكيد الحجز.'
        },
        {
          question: 'ما هي طرق الدفع المتاحة؟',
          answer: 'نقبل الدفع نقداً، بطاقات الائتمان (Visa, Mastercard)، وبطاقات الخصم المباشر. يمكن الدفع عند استلام السيارة أو مقدماً عبر الإنترنت.'
        },
        {
          question: 'هل يمكنني إلغاء أو تعديل حجزي؟',
          answer: 'نعم، يمكنك إلغاء أو تعديل حجزك قبل 24 ساعة من موعد الاستلام دون أي رسوم. للإلغاء في اللحظة الأخيرة، قد تطبق رسوم إلغاء بنسبة 20%.'
        },
        {
          question: 'هل هناك خصومات للحجوزات الطويلة؟',
          answer: 'نعم! نقدم أسعار خاصة للحجوزات الأسبوعية والشهرية. الحجز لمدة 7 أيام أو أكثر يوفر لك حتى 15%، والحجز الشهري يوفر حتى 25%.'
        }
      ]
    },
    {
      category: 'المستندات والتأمين',
      questions: [
        {
          question: 'ما هي المستندات المطلوبة لاستئجار سيارة؟',
          answer: 'تحتاج إلى: (1) رخصة قيادة سارية المفعول، (2) بطاقة هوية وطنية أو جواز سفر، (3) بطاقة ائتمان أو خصم باسمك. للسياح الأجانب: رخصة قيادة دولية وجواز سفر.'
        },
        {
          question: 'ما أنواع التأمين المتاحة؟',
          answer: 'نقدم ثلاثة خيارات: (1) التأمين الأساسي - التغطية الأساسية للحوادث، (2) التأمين الكامل - تغطية شاملة، (3) التأمين المميز - تغطية كاملة مع دعم على مدار الساعة ومساعدة على الطريق.'
        },
        {
          question: 'هل التأمين إلزامي؟',
          answer: 'نعم، جميع السيارات تأتي مع تأمين أساسي إلزامي. يمكنك اختيار ترقية التأمين إلى الكامل أو المميز لمزيد من الراحة والحماية.'
        },
        {
          question: 'ماذا يحدث في حالة وقوع حادث؟',
          answer: 'في حالة وقوع حادث: (1) تأكد من سلامة الجميع واتصل بالشرطة، (2) اتصل بنا فوراً على الرقم 077-776-9776، (3) لا تترك موقع الحادث قبل وصول الشرطة، (4) التقط صوراً إن أمكن. فريقنا سيساعدك في جميع الإجراءات.'
        }
      ]
    },
    {
      category: 'الاستلام والتسليم',
      questions: [
        {
          question: 'أين يمكنني استلام السيارة؟',
          answer: 'يمكنك استلام السيارة من مقرنا الرئيسي في عمان أو من مطار الملكة علياء الدولي (مقابل رسوم إضافية بسيطة). نوفر أيضاً خدمة التوصيل إلى موقعك.'
        },
        {
          question: 'هل تقدمون خدمة التوصيل إلى المطار؟',
          answer: 'نعم! نقدم خدمة توصيل السيارة إلى مطار الملكة علياء الدولي مقابل رسوم قدرها 25 دينار أردني فقط. هذه الخدمة متاحة على مدار الساعة.'
        },
        {
          question: 'ماذا لو تأخرت في إعادة السيارة؟',
          answer: 'يُسمح بفترة سماح مدتها ساعة واحدة. بعد ذلك، سيتم احتساب رسوم تأخير بمعدل 10% من سعر اليوم الواحد لكل ساعة تأخير. يرجى الاتصال بنا إذا كنت تتوقع التأخير.'
        },
        {
          question: 'هل يمكنني إعادة السيارة في موقع مختلف؟',
          answer: 'نعم، نوفر خدمة الإعادة في موقع مختلف داخل الأردن. قد تطبق رسوم إضافية حسب المسافة. يرجى إبلاغنا عند الحجز لترتيب ذلك.'
        }
      ]
    },
    {
      category: 'الوقود والصيانة',
      questions: [
        {
          question: 'هل السيارة تأتي بخزان وقود ممتلئ؟',
          answer: 'نعم، جميع سياراتنا تُسلم بخزان وقود ممتلئ. نتوقع إعادتها بنفس المستوى أو يمكنك اختيار خدمة "إعادة فارغ" مع دفع ثمن الوقود مسبقاً.'
        },
        {
          question: 'ماذا لو واجهت مشكلة فنية في السيارة؟',
          answer: 'اتصل بنا فوراً على الرقم 077-776-9776. لدينا فريق دعم فني على مدار الساعة. سنقوم بإصلاح المشكلة أو توفير سيارة بديلة إذا لزم الأمر.'
        },
        {
          question: 'هل الصيانة الدورية مشمولة؟',
          answer: 'جميع سياراتنا تخضع لصيانة دورية منتظمة قبل كل تأجير. إذا احتاجت السيارة لصيانة أثناء فترة الإيجار، سنتحمل التكاليف بشرط أن يكون الضرر ليس بسبب سوء الاستخدام.'
        }
      ]
    },
    {
      category: 'القيادة والسفر',
      questions: [
        {
          question: 'هل يمكنني القيادة خارج الأردن؟',
          answer: 'نعم، يمكنك القيادة إلى بعض الدول المجاورة (مصر، السعودية، فلسطين) بموافقة مسبقة. يرجى إبلاغنا عند الحجز لترتيب التأمين الدولي المطلوب.'
        },
        {
          question: 'هل هناك حد أقصى للكيلومترات؟',
          answer: 'معظم حجوزاتنا تأتي بكيلومترات غير محدودة داخل الأردن. للرحلات الدولية، يطبق حد معين حسب الوجهة. سنوضح ذلك في عقد الإيجار.'
        },
        {
          question: 'هل يمكن لشخص آخر قيادة السيارة؟',
          answer: 'نعم، يمكن إضافة سائق إضافي بتكلفة 5 دنانير أردنية يومياً. يجب أن يكون السائق الإضافي مذكوراً في العقد ويستوفي نفس شروط التأجير.'
        }
      ]
    },
    {
      category: 'خدمات إضافية',
      questions: [
        {
          question: 'هل تقدمون مقاعد أطفال؟',
          answer: 'نعم، نوفر مقاعد أطفال بمختلف الأحجام مقابل دينار أردني واحد يومياً. يرجى طلبها عند الحجز لضمان التوفر.'
        },
        {
          question: 'هل هناك خدمة واي فاي في السيارات؟',
          answer: 'نعم، نقدم أجهزة واي فاي محمولة مقابل 2 دينار يومياً. توفر اتصال إنترنت عالي السرعة يصل إلى 5 أجهزة.'
        },
        {
          question: 'هل تقدمون خدمة سائق خاص؟',
          answer: 'نعم، يمكننا توفير سائق محترف مقابل 40 دينار لكل 8 ساعات. السائق لديه معرفة جيدة بالأردن ويتحدث العربية والإنجليزية.'
        },
        {
          question: 'هل يمكنني الحصول على فاتورة ضريبية؟',
          answer: 'بالتأكيد! نوفر فواتير ضريبية رسمية لجميع المعاملات. يمكنك طلبها عند التسليم أو إرسالها عبر البريد الإلكتروني.'
        }
      ]
    }
  ] : [
    {
      category: 'Booking & Pricing',
      questions: [
        {
          question: 'How do I book a car?',
          answer: 'You can easily book a car through our website. Choose your preferred vehicle, select rental dates, fill in your information, and submit. We\'ll contact you within 24 hours to confirm your booking.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept cash, credit cards (Visa, Mastercard), and debit cards. Payment can be made upon car pickup or online in advance.'
        },
        {
          question: 'Can I cancel or modify my booking?',
          answer: 'Yes, you can cancel or modify your booking up to 24 hours before pickup without any fees. Last-minute cancellations may incur a 20% cancellation fee.'
        },
        {
          question: 'Are there discounts for long-term rentals?',
          answer: 'Yes! We offer special rates for weekly and monthly rentals. Booking for 7+ days saves up to 15%, and monthly bookings save up to 25%.'
        }
      ]
    },
    {
      category: 'Documents & Insurance',
      questions: [
        {
          question: 'What documents do I need to rent a car?',
          answer: 'You need: (1) Valid driver\'s license, (2) National ID or passport, (3) Credit or debit card in your name. For foreign tourists: International driving permit and passport.'
        },
        {
          question: 'What insurance options are available?',
          answer: 'We offer three options: (1) Basic Insurance - Basic accident coverage, (2) Full Insurance - Comprehensive coverage, (3) Premium Insurance - Full coverage with 24/7 support and roadside assistance.'
        },
        {
          question: 'Is insurance mandatory?',
          answer: 'Yes, all cars come with mandatory basic insurance. You can upgrade to full or premium insurance for additional peace of mind and protection.'
        },
        {
          question: 'What happens in case of an accident?',
          answer: 'In case of an accident: (1) Ensure everyone\'s safety and call police, (2) Contact us immediately at 077-776-9776, (3) Don\'t leave the scene before police arrive, (4) Take photos if possible. Our team will assist with all procedures.'
        }
      ]
    },
    {
      category: 'Pickup & Return',
      questions: [
        {
          question: 'Where can I pick up the car?',
          answer: 'You can pick up from our main office in Amman or Queen Alia International Airport (for a small additional fee). We also offer delivery to your location.'
        },
        {
          question: 'Do you offer airport delivery?',
          answer: 'Yes! We deliver cars to Queen Alia International Airport for just 25 JOD. This service is available 24/7.'
        },
        {
          question: 'What if I\'m late returning the car?',
          answer: 'A 1-hour grace period is allowed. After that, late fees of 10% of the daily rate per hour apply. Please call us if you expect to be late.'
        },
        {
          question: 'Can I return the car at a different location?',
          answer: 'Yes, we offer one-way rentals within Jordan. Additional fees may apply depending on the distance. Please inform us when booking.'
        }
      ]
    },
    {
      category: 'Fuel & Maintenance',
      questions: [
        {
          question: 'Does the car come with a full tank?',
          answer: 'Yes, all our cars are delivered with a full fuel tank. We expect it returned at the same level, or you can choose "return empty" with prepaid fuel.'
        },
        {
          question: 'What if I experience a technical issue?',
          answer: 'Call us immediately at 077-776-9776. We have 24/7 technical support. We\'ll fix the issue or provide a replacement car if needed.'
        },
        {
          question: 'Is regular maintenance included?',
          answer: 'All our cars undergo regular maintenance before each rental. If the car needs service during your rental, we\'ll cover costs provided the damage wasn\'t due to misuse.'
        }
      ]
    },
    {
      category: 'Driving & Travel',
      questions: [
        {
          question: 'Can I drive outside Jordan?',
          answer: 'Yes, you can drive to some neighboring countries (Egypt, Saudi Arabia, Palestine) with prior approval. Please inform us when booking to arrange required international insurance.'
        },
        {
          question: 'Is there a mileage limit?',
          answer: 'Most of our rentals come with unlimited mileage within Jordan. For international trips, specific limits apply based on destination. This will be clarified in the rental agreement.'
        },
        {
          question: 'Can someone else drive the car?',
          answer: 'Yes, additional drivers can be added for 5 JOD per day. The additional driver must be listed on the contract and meet the same rental requirements.'
        }
      ]
    },
    {
      category: 'Additional Services',
      questions: [
        {
          question: 'Do you provide child seats?',
          answer: 'Yes, we provide child seats of various sizes for 1 JOD per day. Please request when booking to ensure availability.'
        },
        {
          question: 'Is WiFi available in cars?',
          answer: 'Yes, we offer portable WiFi devices for 2 JOD per day. They provide high-speed internet for up to 5 devices.'
        },
        {
          question: 'Do you offer chauffeur service?',
          answer: 'Yes, we can provide a professional driver for 40 JOD per 8 hours. Drivers are knowledgeable about Jordan and speak Arabic and English.'
        },
        {
          question: 'Can I get a tax invoice?',
          answer: 'Absolutely! We provide official tax invoices for all transactions. You can request it at delivery or have it emailed to you.'
        }
      ]
    }
  ];

  // Flatten for search
  const allQuestions = faqs.flatMap(category =>
    category.questions.map(q => ({ ...q, category: category.category }))
  );

  const filteredFAQs = searchTerm
    ? allQuestions.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  // Generate FAQ schema for SEO
  const faqSchemaData = getFAQSchema(
    allQuestions.map(q => ({ question: q.question, answer: q.answer }))
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <SEO
        title={language === 'ar' ? 'الأسئلة الشائعة - الفخامة لتأجير السيارات' : 'Frequently Asked Questions - Al-Fakhama Car Rental'}
        description={language === 'ar' ? 'أجوبة على أسئلتك حول تأجير السيارات في الأردن. التأمين، الأسعار، المستندات، والمزيد.' : 'Answers to your car rental questions in Jordan. Insurance, pricing, documents, and more.'}
        keywords="car rental FAQ, rent a car questions, Jordan car rental help, rental insurance, booking questions"
        structuredData={faqSchemaData}
        lang={language}
      />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div
          ref={addToRefs}
          className={`text-center mb-12 transition-all duration-1000 ${
            visibleSections.has(0) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {language === 'ar'
              ? 'ابحث عن إجابات سريعة لأسئلتك حول تأجير السيارات في الأردن'
              : 'Find quick answers to your car rental questions in Jordan'}
          </p>
        </div>

        {/* Search Bar */}
        <div
          ref={addToRefs}
          className={`max-w-2xl mx-auto mb-12 transition-all duration-1000 ${
            visibleSections.has(1) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="relative">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث في الأسئلة...' : 'Search questions...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* FAQ Categories */}
        {!searchTerm ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {faqs.map((category, catIndex) => (
              <div
                key={catIndex}
                ref={addToRefs}
                className={`transition-all duration-1000 ${
                  visibleSections.has(catIndex + 2) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
                }`}
              >
                <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center text-lg">
                    {catIndex + 1}
                  </span>
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const index = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === index;

                    return (
                      <div
                        key={qIndex}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : index)}
                          className="w-full text-left p-6 flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-800 text-lg flex-1">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`flex-shrink-0 text-blue-900 transition-transform duration-300 ${
                              isOpen ? 'transform rotate-180' : ''
                            }`}
                            size={24}
                          />
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isOpen ? 'max-h-96' : 'max-h-0'
                          }`}
                        >
                          <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Search Results */
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {language === 'ar' ? `نتائج البحث (${filteredFAQs.length})` : `Search Results (${filteredFAQs.length})`}
            </h2>

            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => {
                  const isOpen = openIndex === `search-${index}`;

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : `search-${index}`)}
                        className="w-full text-left p-6 flex justify-between items-start gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800 text-lg block mb-2">
                            {faq.question}
                          </span>
                          <span className="text-sm text-blue-600">
                            {faq.category}
                          </span>
                        </div>
                        <ChevronDown
                          className={`flex-shrink-0 text-blue-900 transition-transform duration-300 ${
                            isOpen ? 'transform rotate-180' : ''
                          }`}
                          size={24}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 text-lg">
                  {language === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Contact CTA */}
        <div
          ref={addToRefs}
          className={`max-w-4xl mx-auto mt-16 bg-gradient-to-r from-blue-900 to-slate-600 rounded-2xl p-8 text-white text-center transition-all duration-1000 ${
            visibleSections.has(faqs.length + 2) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <h2 className="text-3xl font-bold mb-4">
            {language === 'ar' ? 'لم تجد إجابة؟' : 'Didn\'t Find Your Answer?'}
          </h2>
          <p className="text-lg mb-6 opacity-90">
            {language === 'ar'
              ? 'فريقنا جاهز لمساعدتك على مدار الساعة'
              : 'Our team is ready to help you 24/7'}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+962777769776"
              className="flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              <Phone size={20} />
              <span>{language === 'ar' ? 'اتصل بنا' : 'Call Us'}</span>
            </a>

            <a
              href="https://wa.me/962777769776"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all transform hover:scale-105"
            >
              <MessageCircle size={20} />
              <span>WhatsApp</span>
            </a>

            <a
              href="/contact-us"
              className="flex items-center gap-2 bg-white/20 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all transform hover:scale-105"
            >
              <Mail size={20} />
              <span>{language === 'ar' ? 'راسلنا' : 'Email Us'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
