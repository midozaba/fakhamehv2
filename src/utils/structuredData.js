/**
 * Structured Data (Schema.org JSON-LD) generators
 * For better SEO and rich snippets in search results
 */

const SITE_URL = 'https://www.al-fakhamah-car-rent.com';
const COMPANY_NAME = 'Al-Fakhama Car Rental';
const LOGO_URL = `${SITE_URL}/logo.png`;

/**
 * Organization Schema
 */
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: COMPANY_NAME,
  url: SITE_URL,
  logo: LOGO_URL,
  description: 'Premium car rental services in Jordan with 24/7 customer support',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Queen Alia Airport Road',
    addressLocality: 'Amman',
    addressCountry: 'JO',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+962-77-776-9776',
    contactType: 'Customer Service',
    availableLanguage: ['English', 'Arabic'],
  },
  sameAs: [
    'https://www.facebook.com/fakhama.rental/',
    'https://www.instagram.com/fakhama.rental',
    'https://wa.me/962777769776',
  ],
});

/**
 * Website Schema
 */
export const getWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: COMPANY_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/cars?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

/**
 * Car Rental Service Schema
 */
export const getCarRentalServiceSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'AutoRental',
  name: COMPANY_NAME,
  image: LOGO_URL,
  '@id': SITE_URL,
  url: SITE_URL,
  telephone: '+962-77-776-9776',
  priceRange: '15 JOD - 100 JOD per day',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Queen Alia Airport Road',
    addressLocality: 'Amman',
    addressCountry: 'JO',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 32.0215589,
    longitude: 35.8641415,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: '00:00',
    closes: '23:59',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '150',
  },
});

/**
 * Car Product Schema for individual car listings
 */
export const getCarProductSchema = (car) => {
  if (!car) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/cars/${car.id}`,
    name: `${car.car_barnd} ${car.car_type} ${car.car_model}`,
    image: car.image_url || `${SITE_URL}/car-images/${car.car_barnd.toLowerCase()}.jpg`,
    description: `Rent ${car.car_barnd} ${car.car_type} ${car.car_model} in Jordan. Available for daily, weekly, and monthly rental.`,
    brand: {
      '@type': 'Brand',
      name: car.car_barnd,
    },
    model: car.car_model.toString(),
    color: car.car_color,
    vehicleConfiguration: car.car_type,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/booking/${car.id}`,
      priceCurrency: 'JOD',
      price: car.price_per_day,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: car.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: COMPANY_NAME,
      },
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Price Per Week',
        value: `${car.price_per_week} JOD`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Price Per Month',
        value: `${car.price_per_month} JOD`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Mileage',
        value: `${car.mileage} km`,
      },
    ],
  };
};

/**
 * ItemList Schema for car listings page
 */
export const getCarsListSchema = (cars) => {
  if (!cars || cars.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cars.map((car, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        '@id': `${SITE_URL}/cars/${car.id}`,
        name: `${car.car_barnd} ${car.car_type}`,
        image: car.image_url || `${SITE_URL}/car-images/${car.car_barnd.toLowerCase()}.jpg`,
        offers: {
          '@type': 'Offer',
          price: car.price_per_day,
          priceCurrency: 'JOD',
        },
      },
    })),
  };
};

/**
 * Breadcrumb Schema
 */
export const getBreadcrumbSchema = (items) => {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
};

/**
 * FAQ Schema
 */
export const getFAQSchema = (faqs) => {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

/**
 * Review Schema
 */
export const getReviewSchema = (reviews) => {
  if (!reviews || reviews.length === 0) return null;

  return reviews.map(review => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.date,
    reviewBody: review.text,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: '5',
      worstRating: '1',
    },
    itemReviewed: {
      '@type': 'AutoRental',
      name: COMPANY_NAME,
    },
  }));
};

/**
 * LocalBusiness Schema
 */
export const getLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': SITE_URL,
  name: COMPANY_NAME,
  image: LOGO_URL,
  url: SITE_URL,
  telephone: '+962-77-776-9776',
  email: 'info@alfakhama.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Queen Alia Airport Road',
    addressLocality: 'Amman',
    postalCode: '11941',
    addressCountry: 'JO',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 32.0215589,
    longitude: 35.8641415,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  ],
  priceRange: '15 JOD - 100 JOD',
  paymentAccepted: 'Cash, Credit Card, Debit Card',
  currenciesAccepted: 'JOD, USD',
});

export default {
  getOrganizationSchema,
  getWebsiteSchema,
  getCarRentalServiceSchema,
  getCarProductSchema,
  getCarsListSchema,
  getBreadcrumbSchema,
  getFAQSchema,
  getReviewSchema,
  getLocalBusinessSchema,
};
