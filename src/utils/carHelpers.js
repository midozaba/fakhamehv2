export const categorizeCarType = (carType) => {
  const type = carType.toLowerCase();
  if (['i10', 'picanto', 'pegas'].includes(type)) return 'economy';
  if (['elantra', 'cerato', 'corolla', 'fusion'].includes(type)) return 'sedan';
  if (['seltos', 'sonet', 'captiva'].includes(type)) return 'suv';
  if (['h1'].includes(type)) return 'van';
  if (['camry', 'sonata'].includes(type)) return 'luxury';
  return 'compact';
};

export const getCarImage = (brand, type) => {
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

export const calculatePrice = (selectedCar, bookingData) => {
  if (!selectedCar) return { basePrice: 0, insurancePrice: 0, servicesPrice: 0, airportPickupPrice: 0, total: 0 };

  let basePrice = selectedCar.PRICEPERDAY * bookingData.days;
  let insurancePrice = 0;
  let servicesPrice = 0;
  let airportPickupPrice = 0;

  if (bookingData.insurance === 'basic') insurancePrice = 5 * bookingData.days;
  else if (bookingData.insurance === 'full') insurancePrice = 10 * bookingData.days;
  else if (bookingData.insurance === 'premium') insurancePrice = 15 * bookingData.days;

  bookingData.additionalServices.forEach(service => {
    if (service === 'phone') servicesPrice += 3 * bookingData.days;
    else if (service === 'wifi') servicesPrice += 2 * bookingData.days;
    else if (service === 'gps') servicesPrice += 2 * bookingData.days;
    else if (service === 'childSeat') servicesPrice += 1 * bookingData.days;
    else if (service === 'airportPickup') airportPickupPrice = 25; // One-time fee
  });

  return {
    basePrice,
    insurancePrice,
    servicesPrice,
    airportPickupPrice,
    total: basePrice + insurancePrice + servicesPrice + airportPickupPrice
  };
};