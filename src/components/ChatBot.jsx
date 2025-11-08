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

  // Knowledge Base for Questions and Answers
  const knowledgeBase = {
    // Requirements & Conditions (المتطلبات والشروط)
    documents: {
      keywords: {
        ar: ["مستندات", "وثائق", "أوراق", "مطلوب", "احتاج"],
        en: ["documents", "required", "need", "papers", "necessary"]
      },
      answer: {
        ar: "المستندات المطلوبة لتأجير سيارة:\n• رخصة قيادة سارية المفعول\n• بطاقة هوية / أو رخصة سوق / أو جواز سفر\n• بطاقة ائتمان باسم المستأجر\n• إثبات عنوان السكن (في بعض الحالات)",
        en: "Required documents for car rental:\n• Valid driver's license\n• National ID card / or driver license / or passport\n• Credit card in renter's name\n• Proof of residence (in some cases)"
      }
    },
    age: {
      keywords: {
        ar: ["سن", "عمر", "الحد الأدنى", "كم عمر"],
        en: ["age", "minimum", "old", "years"]
      },
      answer: {
        ar: "الحد الأدنى للسن لتأجير السيارة هو 21 سنة. قد تنطبق رسوم إضافية على السائقين تحت سن 25 سنة.",
        en: "The minimum age for renting a car is 21 years. Additional fees may apply for drivers under 25 years old."
      }
    },
    internationalLicense: {
      keywords: {
        ar: ["رخصة دولية", "رخصة قيادة دولية", "رخصة أجنبية"],
        en: ["international license", "international driving", "foreign license"]
      },
      answer: {
        ar: "نعم، نقبل رخصة القيادة الدولية بشرط أن تكون سارية المفعول ومرفقة برخصة القيادة الأصلية من بلدك.",
        en: "Yes, we accept international driving licenses provided they are valid and accompanied by your original driver's license from your country."
      }
    },
    creditCard: {
      keywords: {
        ar: ["بطاقة ائتمان", "فيزا", "ماستر كارد", "كريديت"],
        en: ["credit card", "visa", "mastercard", "payment card"]
      },
      answer: {
        ar: "نعم، بطاقة الائتمان مطلوبة لحجز الضمان. نقبل فيزا وماستركارد. يجب أن تكون البطاقة باسم السائق الرئيسي.",
        en: "Yes, a credit card is required for the security deposit. We accept Visa and Mastercard. The card must be in the main driver's name."
      }
    },
    additionalDriver: {
      keywords: {
        ar: ["سائق إضافي", "شخص آخر", "غير المستأجر", "سائق ثاني"],
        en: ["additional driver", "another person", "second driver", "other driver"]
      },
      answer: {
        ar: "نعم، يمكن إضافة سائقين إضافيين بشرط تسجيلهم في عقد الإيجار وتقديم رخصة قيادة سارية. قد تطبق رسوم إضافية.",
        en: "Yes, additional drivers can be added provided they are registered in the rental contract and have a valid driver's license. Additional fees may apply."
      }
    },

    // Booking & Pricing (الحجز والتسعير)
    booking: {
      keywords: {
        ar: ["حجز", "كيف احجز", "طريقة الحجز", "حجز سيارة"],
        en: ["book", "booking", "reserve", "reservation", "how to book"]
      },
      answer: {
        ar: "يمكنك حجز سيارة بإحدى الطرق التالية:\n• عبر موقعنا الإلكتروني\n• الاتصال بمركز خدمة العملاء\n• زيارة أحد فروعنا\n• عبر تطبيق الهاتف المحمول",
        en: "You can book a car through:\n• Our website\n• Customer service center call\n• Visiting one of our branches\n• Mobile app"
      }
    },
    paymentMethods: {
      keywords: {
        ar: ["طرق الدفع", "الدفع", "كيف ادفع", "وسائل الدفع"],
        en: ["payment methods", "pay", "payment", "how to pay"]
      },
      answer: {
        ar: "طرق الدفع المتاحة:\n• بطاقات الائتمان (فيزا، ماستركارد)\n• النقد عند الاستلام\n• التحويل البنكي (للشركات)\n• بطاقات الخصم",
        en: "Available payment methods:\n• Credit cards (Visa, Mastercard)\n• Cash on pickup\n• Bank transfer (for companies)\n• Debit cards"
      }
    },
    modifyCancel: {
      keywords: {
        ar: ["تعديل", "إلغاء", "تغيير الحجز", "الغاء الحجز"],
        en: ["modify", "cancel", "change", "cancellation", "modification"]
      },
      answer: {
        ar: "نعم، يمكنك تعديل أو إلغاء الحجز:\n• مجاناً قبل 24 ساعة من موعد الاستلام\n• قد تطبق رسوم إلغاء للحجوزات المتأخرة\n• اتصل بخدمة العملاء لإجراء التعديلات",
        en: "Yes, you can modify or cancel the booking:\n• Free of charge 24 hours before pickup\n• Late cancellation fees may apply\n• Contact customer service for modifications"
      }
    },
    priceIncludes: {
      keywords: {
        ar: ["سعر", "يشمل", "التسعير", "ماذا يشمل السعر", "price", "كلفة", "cost"],
        en: ["price", "includes", "pricing", "what includes", "cost"]
      },
      answer: {
        ar: "سعر التأجير يشمل:\n• التأمين الأساسي\n• الصيانة الدورية\n• المساعدة على الطريق 24/7\n• الكيلومترات المحددة حسب الباقة\n\nلا يشمل: الوقود، الرسوم الإضافية، التأمين الشامل",
        en: "Rental price includes:\n• Basic insurance\n• Regular maintenance\n• 24/7 roadside assistance\n• Specified kilometers per package\n\nNot included: Fuel, additional fees, comprehensive insurance"
      }
    },
    discounts: {
      keywords: {
        ar: ["عروض", "خصم", "خصومات", "عملاء دائمين"],
        en: ["offers", "discount", "discounts", "special offers", "loyal customers"]
      },
      answer: {
        ar: "نعم، نقدم:\n• خصومات للعملاء الدائمين\n• عروض موسمية خاصة\n• أسعار مخفضة للحجوزات الطويلة\n• برنامج نقاط الولاء\n\nاشترك في نشرتنا البريدية لمعرفة أحدث العروض!",
        en: "Yes, we offer:\n• Discounts for loyal customers\n• Special seasonal offers\n• Reduced rates for long-term bookings\n• Loyalty points program\n\nSubscribe to our newsletter for latest offers!"
      }
    },
    insuranceIncluded: {
      keywords: {
        ar: ["تأمين كامل", "تأمين شامل", "الأسعار تشمل"],
        en: ["full insurance", "comprehensive insurance", "prices include insurance"]
      },
      answer: {
        ar: "أسعارنا تشمل التأمين الأساسي. التأمين الشامل متوفر كخيار إضافي يغطي:\n• جميع الأضرار\n• السرقة\n• أضرار الطرف الثالث\n• تكلفته تتراوح بين 5-15$ يومياً حسب نوع السيارة",
        en: "Our prices include basic insurance. Comprehensive insurance is available as an add-on covering:\n• All damages\n• Theft\n• Third-party damages\n• Costs range from $5-15 per day depending on car type"
      }
    },

    // Insurance & Deposit (التأمين والضمان)
    deposit: {
      keywords: {
        ar: ["ضمان", "كاش", "deposit", "تأمين نقدي"],
        en: ["deposit", "cash", "security", "hold"]
      },
      answer: {
        ar: "الضمان (الكاش) هو مبلغ محجوز على بطاقتك الائتمانية:\n• يتراوح بين 200-500$ حسب نوع السيارة\n• يُعاد بالكامل عند إرجاع السيارة بنفس الحالة\n• يُستخدم لتغطية المخالفات أو الأضرار إن وجدت\n• يُحجز فقط ولا يُسحب من حسابك",
        en: "Deposit (security hold) is an amount held on your credit card:\n• Ranges from $200-500 depending on car type\n• Fully refunded when car returned in same condition\n• Used to cover violations or damages if any\n• Only held, not withdrawn from your account"
      }
    },
    insuranceTypes: {
      keywords: {
        ar: ["فرق بين التأمين", "أنواع التأمين", "تأمين أساسي"],
        en: ["difference insurance", "types of insurance", "basic insurance"]
      },
      answer: {
        ar: "الفرق بين أنواع التأمين:\n\n• التأمين الأساسي (مشمول):\n  - تأمين الطرف الثالث\n  - تحمل جزئي للأضرار\n\n• التأمين الشامل (إضافي):\n  - تغطية كاملة لجميع الأضرار\n  - بدون تحمل\n  - يشمل السرقة والحريق",
        en: "Difference between insurance types:\n\n• Basic Insurance (included):\n  - Third-party insurance\n  - Partial liability for damages\n\n• Comprehensive Insurance (additional):\n  - Full coverage for all damages\n  - Zero liability\n  - Includes theft and fire"
      }
    },
    insuranceMandatory: {
      keywords: {
        ar: ["التأمين إلزامي", "وجوب التأمين", "هل التأمين مطلوب"],
        en: ["insurance mandatory", "insurance required", "must have insurance"]
      },
      answer: {
        ar: "التأمين الأساسي إلزامي ومشمول في السعر. التأمين الشامل اختياري لكن ننصح به بشدة لراحة بالك وحمايتك الكاملة.",
        en: "Basic insurance is mandatory and included in the price. Comprehensive insurance is optional but highly recommended for your peace of mind and full protection."
      }
    },
    accident: {
      keywords: {
        ar: ["حادث", "تعرضت لحادث", "اصطدام", "حادث سير"],
        en: ["accident", "crash", "collision", "incident"]
      },
      answer: {
        ar: "في حالة وقوع حادث:\n1. اتصل بالشرطة فوراً (رقم الطوارئ)\n2. اتصل بخدمة العملاء لدينا على مدار الساعة\n3. لا تترك موقع الحادث قبل وصول الشرطة\n4. التقط صوراً للأضرار إن أمكن\n5. احصل على تقرير الشرطة\n\nسنساعدك في جميع الإجراءات!",
        en: "In case of an accident:\n1. Call police immediately (emergency number)\n2. Call our 24/7 customer service\n3. Don't leave accident scene before police arrival\n4. Take photos of damages if possible\n5. Obtain police report\n\nWe'll assist you with all procedures!"
      }
    },

    // Pickup & Return (الاستلام والتسليم)
    pickupLocation: {
      keywords: {
        ar: ["استلام", "أين استلم", "موقع الاستلام", "فرع"],
        en: ["pickup", "where pickup", "pickup location", "branch"]
      },
      answer: {
        ar: "يمكنك استلام السيارة من:\n• أي من فروعنا المنتشرة\n• المطار (خدمة متوفرة)\n• توصيل للفندق أو المنزل (رسوم إضافية)\n\nحدد الموقع المناسب لك عند الحجز!",
        en: "You can pickup the car from:\n• Any of our branches\n• Airport (service available)\n• Hotel or home delivery (additional fees)\n\nSelect your preferred location when booking!"
      }
    },
    lateReturn: {
      keywords: {
        ar: ["تأخير", "تأخر الإرجاع", "متأخر"],
        en: ["late", "delay", "late return", "delayed"]
      },
      answer: {
        ar: "إذا أردت تأخير إرجاع السيارة:\n• اتصل بنا قبل موعد الإرجاع المحدد\n• قد تطبق رسوم تمديد يومية\n• فترة سماح: ساعة واحدة مجاناً\n• بعد ذلك تحسب كيوم إضافي\n\nالتواصل المسبق يوفر لك المال!",
        en: "If you want to delay car return:\n• Contact us before scheduled return time\n• Daily extension fees may apply\n• Grace period: one hour free\n• After that, charged as additional day\n\nAdvance communication saves you money!"
      }
    },
    pickupProcedure: {
      keywords: {
        ar: ["إجراءات الاستلام", "عملية الاستلام", "خطوات الاستلام"],
        en: ["pickup procedure", "pickup process", "pickup steps"]
      },
      answer: {
        ar: "إجراءات استلام السيارة:\n1. إحضار المستندات المطلوبة\n2. التوقيع على عقد الإيجار\n3. دفع المبلغ المستحق والضمان\n4. فحص السيارة معنا وتوثيق حالتها\n5. استلام المفاتيح والوثائق\n\nالعملية تستغرق 15-20 دقيقة",
        en: "Car pickup procedures:\n1. Bring required documents\n2. Sign rental contract\n3. Pay amount due and deposit\n4. Inspect car with us and document condition\n5. Receive keys and documents\n\nProcess takes 15-20 minutes"
      }
    },
    returnProcedure: {
      keywords: {
        ar: ["إجراءات الإرجاع", "إرجاع السيارة", "تسليم السيارة"],
        en: ["return procedure", "return process", "car return"]
      },
      answer: {
        ar: "إجراءات إرجاع السيارة:\n1. ملء خزان الوقود إلى نفس المستوى\n2. تنظيف السيارة من الداخل\n3. فحص السيارة مع موظفينا\n4. إعادة المفاتيح والوثائق\n5. إعادة مبلغ الضمان (2-5 أيام عمل)\n\nالإرجاع المبكر لا يستحق استرداد مالي",
        en: "Car return procedures:\n1. Fill fuel tank to same level\n2. Clean car interior\n3. Inspect car with our staff\n4. Return keys and documents\n5. Deposit refund (2-5 business days)\n\nEarly return not eligible for refund"
      }
    },
    differentLocation: {
      keywords: {
        ar: ["فرع آخر", "مكان مختلف", "استلام وإرجاع مختلف"],
        en: ["different branch", "different location", "one way"]
      },
      answer: {
        ar: "نعم، يمكنك استلام السيارة من فرع وإرجاعها في فرع آخر:\n• خدمة متوفرة بين معظم الفروع\n• قد تطبق رسوم إضافية\n• يجب تحديد ذلك عند الحجز\n• الرسوم تختلف حسب المسافة",
        en: "Yes, you can pick up from one branch and return to another:\n• Service available between most branches\n• Additional fees may apply\n• Must specify this when booking\n• Fees vary by distance"
      }
    },
    latePickup: {
      keywords: {
        ar: ["وصلت متأخر", "تأخرت عن الاستلام", "تأخير الاستلام"],
        en: ["arrived late", "late pickup", "late arrival"]
      },
      answer: {
        ar: "إذا وصلت متأخراً لاستلام السيارة:\n• اتصل بنا لإعلامنا بالتأخير\n• فترة سماح: 2 ساعة بدون رسوم\n• بعد ذلك قد يتم إلغاء الحجز\n• يمكن إعادة جدولة الحجز حسب التوفر\n\nالتواصل مهم جداً!",
        en: "If you arrive late for pickup:\n• Call us to inform about delay\n• Grace period: 2 hours without fees\n• After that, booking may be cancelled\n• Can reschedule based on availability\n\nCommunication is very important!"
      }
    },

    // During Rental Period (أثناء فترة التأجير)
    fuelLevel: {
      keywords: {
        ar: ["وقود", "بنزين", "مستوى الوقود", "fuel"],
        en: ["fuel", "gas", "fuel level", "petrol"]
      },
      answer: {
        ar: "سياسة الوقود:\n• تستلم السيارة بخزان ممتلئ\n• يجب إرجاعها بنفس المستوى (ممتلئة)\n• إذا أرجعتها بوقود أقل، سيتم خصم:\n  - تكلفة الوقود\n  - رسوم خدمة التعبئة\n\nننصح بالتعبئة قبل الإرجاع مباشرة!",
        en: "Fuel policy:\n• Receive car with full tank\n• Must return with same level (full)\n• If returned with less fuel, we'll charge:\n  - Fuel cost\n  - Refueling service fee\n\nWe recommend filling up just before return!"
      }
    },
    breakdown: {
      keywords: {
        ar: ["تعطلت", "عطل", "توقفت السيارة", "مشكلة فنية"],
        en: ["breakdown", "broke down", "car stopped", "technical problem"]
      },
      answer: {
        ar: "إذا تعطلت السيارة:\n1. توقف في مكان آمن\n2. اتصل بخدمة الطوارئ لدينا (24/7)\n3. سنرسل مساعدة فنية فوراً\n4. إذا لزم، سنوفر سيارة بديلة\n\nرقم الطوارئ موجود في عقد الإيجار!",
        en: "If the car breaks down:\n1. Stop in a safe place\n2. Call our emergency service (24/7)\n3. We'll send technical assistance immediately\n4. If needed, we'll provide replacement car\n\nEmergency number is in your rental contract!"
      }
    },
    travelOutside: {
      keywords: {
        ar: ["سفر", "خارج المدينة", "خارج الدولة", "سفر للخارج"],
        en: ["travel", "outside city", "outside country", "cross border"]
      },
      answer: {
        ar: "السفر بالسيارة:\n• داخل الأردن: مسموح بحرية\n• خارج الأردن: يتطلب:\n  - موافقة مسبقة\n  - تأمين إضافي\n  - رسوم إضافية\n  - مستندات إضافية\n\nاتصل بنا قبل السفر للخارج!",
        en: "Traveling with the car:\n• Within Jordan: Freely allowed\n• Outside Jordan: Requires:\n  - Prior approval\n  - Additional insurance\n  - Extra fees\n  - Additional documents\n\nContact us before international travel!"
      }
    },
    smoking: {
      keywords: {
        ar: ["تدخين", "السجائر", "يمكن التدخين"],
        en: ["smoking", "smoke", "cigarettes", "can smoke"]
      },
      answer: {
        ar: "التدخين ممنوع منعاً باتاً في جميع سياراتنا!\n\nفي حالة التدخين:\n• رسوم تنظيف: 50-100$\n• قد يؤثر على مبلغ الضمان\n\nنحترم صحتك وصحة العملاء الآخرين.",
        en: "Smoking is strictly prohibited in all our vehicles!\n\nIf smoking occurs:\n• Cleaning fee: $50-100\n• May affect deposit refund\n\nWe respect your health and other customers' health."
      }
    },
    lostKeys: {
      keywords: {
        ar: ["فقدت المفاتيح", "ضياع المفاتيح", "lost keys"],
        en: ["lost keys", "missing keys", "keys lost"]
      },
      answer: {
        ar: "إذا فقدت مفاتيح السيارة:\n1. اتصل بنا فوراً\n2. لا تحاول فتح السيارة بالقوة\n3. سنرسل مفتاح احتياطي\n4. رسوم استبدال المفتاح:\n  - مفتاح عادي: 30-50$\n  - مفتاح ذكي: 100-200$\n\nاحتفظ بالمفاتيح في مكان آمن!",
        en: "If you lost car keys:\n1. Call us immediately\n2. Don't try to force open the car\n3. We'll send backup key\n4. Key replacement fees:\n  - Regular key: $30-50\n  - Smart key: $100-200\n\nKeep keys in safe place!"
      }
    },

    // Additional Services (خدمات إضافية)
    childSeat: {
      keywords: {
        ar: ["مقعد أطفال", "كرسي أطفال", "مقعد طفل"],
        en: ["child seat", "baby seat", "car seat"]
      },
      answer: {
        ar: "نعم، نقدم مقاعد أطفال:\n• متوفرة لجميع الأعمار\n• رسوم: 3-5$ يومياً\n• يجب طلبها عند الحجز\n• نضمن السلامة والنظافة\n\nسلامة أطفالك أولويتنا!",
        en: "Yes, we provide child seats:\n• Available for all ages\n• Fee: $3-5 per day\n• Must request when booking\n• We guarantee safety and cleanliness\n\nYour children's safety is our priority!"
      }
    },
    withDriver: {
      keywords: {
        ar: ["مع سائق", "بسائق", "سائق خاص"],
        en: ["with driver", "chauffeur", "driver service"]
      },
      answer: {
        ar: "نعم، نقدم خدمة التأجير مع سائق:\n• سائقون محترفون ومرخصون\n• يتحدثون العربية والإنجليزية\n• متاح لجميع أنواع السيارات\n• أسعار خاصة:\n  - نصف يوم: ابتداءً من 40$\n  - يوم كامل: ابتداءً من 70$\n\nراحتك مع سائق محترف!",
        en: "Yes, we offer rental with driver:\n• Professional licensed drivers\n• Speak Arabic and English\n• Available for all car types\n• Special rates:\n  - Half day: from $40\n  - Full day: from $70\n\nYour comfort with professional driver!"
      }
    },
    gps: {
      keywords: {
        ar: ["جي بي اس", "ملاحة", "نظام ملاحة", "GPS"],
        en: ["gps", "navigation", "navigator", "navigation system"]
      },
      answer: {
        ar: "نعم، نقدم نظام ملاحة GPS:\n• متوفر بطلب مسبق\n• رسوم: 3$ يومياً\n• محدث بأحدث الخرائط\n• سهل الاستخدام\n\nأو يمكنك استخدام هاتفك مع حامل مجاني!",
        en: "Yes, we provide GPS navigation system:\n• Available upon request\n• Fee: $3 per day\n• Updated with latest maps\n• Easy to use\n\nOr use your phone with free holder!"
      }
    },
    extension: {
      keywords: {
        ar: ["تمديد", "زيادة المدة", "فترة أطول"],
        en: ["extension", "extend", "longer period", "more days"]
      },
      answer: {
        ar: "تمديد فترة التأجير:\n• اتصل بنا قبل انتهاء المدة\n• حسب التوفر\n• نفس السعر اليومي أو أفضل\n• يمكن التمديد عدة مرات\n\nخصومات خاصة للتمديدات الطويلة!",
        en: "Rental period extension:\n• Call us before period ends\n• Subject to availability\n• Same daily rate or better\n• Can extend multiple times\n\nSpecial discounts for long extensions!"
      }
    },

    // General Issues (مشاكل عامة)
    contact: {
      keywords: {
        ar: ["تواصل", "اتصال", "خدمة العملاء", "رقم"],
        en: ["contact", "call", "customer service", "phone"]
      },
      answer: {
        ar: "يمكنك التواصل معنا:\n• الهاتف: متوفر على الموقع\n• البريد الإلكتروني: info@alfakhama.com\n• الواتساب: خدمة متاحة\n• زيارة الفرع: من 8 صباحاً - 8 مساءً\n• الدعم الطارئ: 24/7\n\nنحن هنا لخدمتك دائماً!",
        en: "You can contact us:\n• Phone: Available on website\n• Email: info@alfakhama.com\n• WhatsApp: Service available\n• Branch visit: 8 AM - 8 PM\n• Emergency support: 24/7\n\nWe're always here to serve you!"
      }
    },
    leftItems: {
      keywords: {
        ar: ["نسيت", "أغراض", "تركت شيء", "ضائعات"],
        en: ["forgot", "left", "belongings", "lost items"]
      },
      answer: {
        ar: "إذا نسيت أغراضك في السيارة:\n1. اتصل بنا فوراً\n2. صف الأغراض بالتفصيل\n3. سنبحث عنها ونتصل بك\n4. يمكنك استلامها من الفرع\n5. أو نرسلها لك (رسوم توصيل)\n\nنحتفظ بالأغراض لمدة 30 يوماً",
        en: "If you forgot items in the car:\n1. Call us immediately\n2. Describe items in detail\n3. We'll search and contact you\n4. Can pick up from branch\n5. Or we'll send it (delivery fee)\n\nWe keep items for 30 days"
      }
    },
    carChoice: {
      keywords: {
        ar: ["اختيار السيارة", "لون", "نوع محدد"],
        en: ["choose car", "color", "specific type"]
      },
      answer: {
        ar: "بخصوص اختيار السيارة:\n• يمكنك اختيار الفئة (اقتصادية، فاخرة، إلخ)\n• اللون والموديل المحدد: حسب التوفر\n• نضمن سيارة من نفس الفئة أو أفضل\n• للمناسبات الخاصة: يمكن الحجز المسبق\n\nسنبذل جهدنا لتلبية تفضيلاتك!",
        en: "Regarding car choice:\n• You can choose category (economy, luxury, etc.)\n• Specific color/model: Subject to availability\n• We guarantee same category or better\n• For special occasions: Advance booking possible\n\nWe'll do our best to meet your preferences!"
      }
    },
    cancellationPolicy: {
      keywords: {
        ar: ["سياسة الإلغاء", "شروط الإلغاء"],
        en: ["cancellation policy", "cancellation terms"]
      },
      answer: {
        ar: "سياسة الإلغاء:\n• قبل 24 ساعة: إلغاء مجاني 100%\n• 12-24 ساعة: رسوم 25%\n• 6-12 ساعة: رسوم 50%\n• أقل من 6 ساعات: رسوم 75%\n• عدم الحضور: لا استرداد\n\nننصح بالإلغاء المبكر إن لزم!",
        en: "Cancellation policy:\n• Before 24 hours: 100% free cancellation\n• 12-24 hours: 25% fee\n• 6-12 hours: 50% fee\n• Less than 6 hours: 75% fee\n• No show: No refund\n\nWe recommend early cancellation if needed!"
      }
    },
    complaint: {
      keywords: {
        ar: ["شكوى", "اقتراح", "تقديم شكوى", "complaint"],
        en: ["complaint", "suggestion", "feedback", "report"]
      },
      answer: {
        ar: "لتقديم شكوى أو اقتراح:\n• املأ نموذج التواصل على الموقع\n• اتصل بقسم خدمة العملاء\n• أرسل بريد إلكتروني مفصل\n• نرد خلال 24 ساعة\n• نأخذ كل ملاحظة بجدية\n\nرأيك يهمنا لتحسين خدماتنا!",
        en: "To submit complaint or suggestion:\n• Fill contact form on website\n• Call customer service department\n• Send detailed email\n• We respond within 24 hours\n• We take every feedback seriously\n\nYour opinion matters for improving our services!"
      }
    }
  };

  const handleChatMessage = (message) => {
    const userMessage = { type: "user", text: message };
    setChatMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      let botResponse = "";
      const lowerMessage = message.toLowerCase();

      // Check greetings first
      const greetings = ["hello", "hi", "مرحبا", "السلام", "أهلا", "hey", "صباح", "مساء"];
      if (greetings.some((greeting) => lowerMessage.includes(greeting))) {
        botResponse =
          language === "ar"
            ? "أهلاً وسهلاً! أنا مساعدك الشخصي لتأجير السيارات. يمكنني مساعدتك في:\n• المتطلبات والشروط\n• الحجز والأسعار\n• التأمين والضمان\n• الاستلام والإرجاع\n• الخدمات الإضافية\n\nما الذي تود معرفته؟"
            : "Hello and welcome! I am your personal car rental assistant. I can help you with:\n• Requirements & Conditions\n• Booking & Pricing\n• Insurance & Deposit\n• Pickup & Return\n• Additional Services\n\nWhat would you like to know?";
      } else {
        // Search knowledge base
        let found = false;
        for (const [key, value] of Object.entries(knowledgeBase)) {
          const keywords = value.keywords[language] || [];
          if (keywords.some((keyword) => lowerMessage.includes(keyword.toLowerCase()))) {
            botResponse = value.answer[language];
            found = true;
            break;
          }
        }

        // Default response if no match found
        if (!found) {
          botResponse =
            language === "ar"
              ? "عذراً، لم أفهم سؤالك بوضوح. يمكنك سؤالي عن:\n• المستندات المطلوبة\n• شروط العمر\n• طرق الحجز والدفع\n• التأمين والضمان\n• إجراءات الاستلام والإرجاع\n• الوقود والأعطال\n• الخدمات الإضافية\n• سياسات الإلغاء والتواصل\n\nأو اكتب سؤالك بطريقة أخرى!"
              : "Sorry, I didn't understand your question clearly. You can ask me about:\n• Required documents\n• Age requirements\n• Booking and payment methods\n• Insurance and deposit\n• Pickup and return procedures\n• Fuel and breakdowns\n• Additional services\n• Cancellation policies and contact\n\nOr try rephrasing your question!";
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
