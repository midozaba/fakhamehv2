import React from 'react';
import { useApp } from '../context/AppContext';

const AboutUs = () => {
  const { language } = useApp();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            {language === 'ar' ? 'من نحن' : 'About Us'}
          </h1>
        </div>

        {/* About Content */}
        <div className={`${language === 'ar' ? 'rtl' : 'ltr'} bg-white rounded-2xl shadow-xl p-8 space-y-8`}>
          {language === 'ar' ? (
            <>
              <section>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">التأسيس</h2>
                <p className="text-gray-700 leading-relaxed">
                  تأسّست الشركة في عام 1993.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">الهوية</h2>
                <p className="text-gray-700 leading-relaxed">
                  اسم "الفخامة" يدلّ على الرقي والفخامة في المظهر والخبرة والسمعة، والسعي لتقديم خدمات عالية المستوى.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">الأسطول</h2>
                <p className="text-gray-700 leading-relaxed">
                  تمتلك الشركة عددًا كبيرًا من السيارات الحديثة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">خدمات الشركة</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  تُقدّم الشركة مجموعة متنوعة من الخدمات التي تلبي احتياجات الزبائن في الأردن، منها:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>سيارات خاصة للشركات و المؤسسات باسعار مميزة </li>
                  <li> مركز صيانة خاص لمعاينة الملركبات بعد الاستلام و أكيد منستقبل سياراتكم الشخصية للصيانة  </li>
                  <li>تغطية كافة الملؤتمرات بطريقة مميزة</li>
                  <li>خدمة توصيل السيارة لزيائنا وين ما كانو برسوم رمزية  </li>
                  <li> أسعار خاصة للأفراد لفترات التاجير طويلة الأمد شهري/سنوي </li>
                  <li>متوفر الكم جميع أنواع السيارات حسب طلبكم (سيارة صغيرة، باصات، سيارات عائلية، سيارات اقتصادية، سيارات luxury) </li>
                  <li>متابعة معكم طوال فترة التاجير و تكفل بالصيانة الدورية</li>


                </ul>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">Establishment</h2>
                <p className="text-gray-700 leading-relaxed">
                  The company was founded in 1993.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">Identity</h2>
                <p className="text-gray-700 leading-relaxed">
                  The name "Al-Fakhama" signifies elegance and luxury in appearance, experience, and reputation, with a commitment to providing high-level services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">Fleet</h2>
                <p className="text-gray-700 leading-relaxed">
                  The company owns a large number of modern vehicles.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">Our Services</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The company offers a variety of services that meet the needs of customers in Jordan, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Private cars for companies and institutions at special rates</li>
                  <li>Dedicated maintenance center for vehicle inspection upon delivery, and we also welcome your personal cars for maintenance</li>
                  <li>Coverage of all conferences in a distinctive manner</li>
                  <li>Car delivery service to our clients wherever they are with nominal fees</li>
                  <li>Special rates for individuals for long-term monthly/annual rentals</li>
                  <li>All types of vehicles available according to your request (compact cars, buses, family cars, economy cars, luxury cars)</li>
                  <li>Follow-up with you throughout the rental period and guaranteed periodic maintenance</li>
                </ul>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;