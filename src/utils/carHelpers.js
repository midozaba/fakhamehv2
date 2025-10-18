export const categorizeCarType = (carType) => {
  const type = carType.toLowerCase();
  if (['i10', 'picanto', 'pegas'].includes(type)) return 'economy';
  if (['elantra', 'cerato', 'corolla', 'fusion'].includes(type)) return 'sedan';
  if (['seltos', 'sonet', 'captiva'].includes(type)) return 'suv';
  if (['h1'].includes(type)) return 'van';
  if (['camry', 'sonata'].includes(type)) return 'luxury';
  return 'compact';
};

// Get the API base URL from environment variables
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  // Remove /api suffix to get base URL
  return apiUrl.replace(/\/api$/, '');
};

// Convert image URL path to full URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) return imagePath;

  // If it starts with /uploads, construct full URL
  if (imagePath.startsWith('/uploads')) {
    return `${getApiBaseUrl()}${imagePath}`;
  }

  return imagePath;
};

export const getCarImage = (brand, type, uploadedImageUrl) => {
  // If there's an uploaded image, use it (check for non-empty string)
  if (uploadedImageUrl && uploadedImageUrl.trim() !== '') {
    return getImageUrl(uploadedImageUrl);
  }

  // Fallback to placeholder images
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

// Location pricing in JOD
export const locationPricing = {
  'Civil Airport (MKA)': 25,
  'Hotels in Amman (AMH)': 10,
  'King Hussein Bridge (KHB)': 35,
  'Queen Alia Airport (AMM)': 25,
  'Sheikh Hussein Bridge (SHB)': 35,
  'alfakhama Office Amman': 0,
  'Madaba City': 20,
  'Madaba Hotels Delivery': 25,
  'Dead Sea': 40,
  'Dead Sea Hotels Delivery': 50,
  'Petra City & Wadi mosa King Hussein International Airport (AQJ)': 60,
  'Aqaba City': 90,
  'Aqaba Hotels Delivery': 110
};

export const locations = [
  'alfakhama Office Amman',
  'Civil Airport (MKA)',
  'Hotels in Amman (AMH)',
  'King Hussein Bridge (KHB)',
  'Queen Alia Airport (AMM)',
  'Sheikh Hussein Bridge (SHB)',
  'Madaba City',
  'Madaba Hotels Delivery',
  'Dead Sea',
  'Dead Sea Hotels Delivery',
  'Petra City & Wadi mosa King Hussein International Airport (AQJ)',
  'Aqaba City',
  'Aqaba Hotels Delivery'
];

export const calculatePrice = (selectedCar, bookingData) => {
  if (!selectedCar) return { basePrice: 0, insurancePrice: 0, servicesPrice: 0, locationPrice: 0, total: 0 };
  if (!bookingData || typeof bookingData.days !== 'number' || bookingData.days <= 0) {
    throw new Error('days is not defined');
  }

  let basePrice = selectedCar.price_per_day * bookingData.days;
  let insurancePrice = 0;
  let servicesPrice = 0;
  let locationPrice = 0;

  if (bookingData.insurance === 'basic') insurancePrice = 5 * bookingData.days;
  else if (bookingData.insurance === 'full') insurancePrice = 10 * bookingData.days;
  else if (bookingData.insurance === 'premium') insurancePrice = 15 * bookingData.days;

  if (bookingData.additionalServices && Array.isArray(bookingData.additionalServices)) {
    bookingData.additionalServices.forEach(service => {
    if (service === 'phone') servicesPrice += 3 * bookingData.days;
    else if (service === 'wifi') servicesPrice += 2 * bookingData.days;
    else if (service === 'gps') servicesPrice += 2 * bookingData.days;
    else if (service === 'childSeat') servicesPrice += 1 * bookingData.days;
    });
  }

  // Calculate location fees
  if (bookingData.pickupLocation && locationPricing[bookingData.pickupLocation]) {
    locationPrice += locationPricing[bookingData.pickupLocation];
  }
  if (bookingData.returnLocation && locationPricing[bookingData.returnLocation]) {
    locationPrice += locationPricing[bookingData.returnLocation];
  }

  return {
    basePrice,
    insurancePrice,
    servicesPrice,
    locationPrice,
    total: basePrice + insurancePrice + servicesPrice + locationPrice
  };
};