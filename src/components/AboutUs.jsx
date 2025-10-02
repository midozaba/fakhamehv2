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
                  <li>تأجير السيارات لفترات قصيرة وطويلة.</li>
                  <li>أسعار مخصّصة للشركات عند التأجير لفترات طويلة.</li>
                  <li>سيارات للزفاف والمؤتمرات وغيرها من المناسبات.</li>
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
                  <li>Short and long-term car rentals.</li>
                  <li>Special rates for corporate long-term rentals.</li>
                  <li>Cars for weddings, conferences, and other special occasions.</li>
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