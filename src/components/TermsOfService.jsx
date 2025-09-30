import React from "react";
import { useTranslation } from "../utils/translations";

const TermsOfService = ({ language }) => {
  const t = useTranslation(language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            {t("termsOfServiceTitle")}
          </h1>
          <p className="text-lg text-gray-600">
            {t("lastUpdated")}: {t("tosDate")}
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">

          {/* Section 1: Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              1. {t("agreementTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("agreementText")}
            </p>
          </section>

          {/* Section 2: Rental Requirements */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              2. {t("rentalRequirementsTitle")}
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t("requirement1")}</li>
              <li>{t("requirement2")}</li>
              <li>{t("requirement3")}</li>
              <li>{t("requirement4")}</li>
            </ul>
          </section>

          {/* Section 3: Vehicle Use */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              3. {t("vehicleUseTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t("vehicleUseText")}
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t("prohibition1")}</li>
              <li>{t("prohibition2")}</li>
              <li>{t("prohibition3")}</li>
              <li>{t("prohibition4")}</li>
            </ul>
          </section>

          {/* Section 4: Payment Terms */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              4. {t("paymentTermsTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("paymentTermsText")}
            </p>
          </section>

          {/* Section 5: Insurance */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              5. {t("insuranceTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("insuranceText")}
            </p>
          </section>

          {/* Section 6: Damages */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              6. {t("damagesTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("damagesText")}
            </p>
          </section>

          {/* Section 7: Cancellation */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              7. {t("cancellationTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("cancellationText")}
            </p>
          </section>

          {/* Section 8: Liability */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              8. {t("liabilityTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("liabilityText")}
            </p>
          </section>

          {/* Section 9: Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              9. {t("privacyTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacyText")}
            </p>
          </section>

          {/* Section 10: Contact */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              10. {t("contactTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("contactText")}
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-900">{t("companyName")}</p>
              <p className="text-blue-800">{t("companyAddress")}</p>
              <p className="text-blue-800">{t("companyPhone")}</p>
              <p className="text-blue-800">{t("companyEmail")}</p>
            </div>
          </section>

        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            {t("tosFooterNote")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;