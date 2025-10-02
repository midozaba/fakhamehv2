import * as yup from 'yup';

// Validation error messages in both languages
export const getValidationMessages = (language) => {
  const messages = {
    en: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      minLength: 'This field is too short',
      maxLength: 'This field is too long',
      minDate: 'Date cannot be in the past',
      dateOrder: 'Return date must be after pickup date',
      license: 'Please enter a valid license number',
      file: 'Please upload the required document',
      fileSize: 'File size must be less than 5MB',
      fileType: 'Invalid file type. Allowed: PDF, JPG, PNG',
    },
    ar: {
      required: 'هذا الحقل مطلوب',
      email: 'يرجى إدخال عنوان بريد إلكتروني صالح',
      phone: 'يرجى إدخال رقم هاتف صالح',
      minLength: 'هذا الحقل قصير جداً',
      maxLength: 'هذا الحقل طويل جداً',
      minDate: 'التاريخ لا يمكن أن يكون في الماضي',
      dateOrder: 'تاريخ الإرجاع يجب أن يكون بعد تاريخ الاستلام',
      license: 'يرجى إدخال رقم رخصة صالح',
      file: 'يرجى تحميل المستند المطلوب',
      fileSize: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت',
      fileType: 'نوع ملف غير صالح. المسموح: PDF، JPG، PNG',
    }
  };
  return messages[language] || messages.en;
};

// Contact form validation schema
export const getContactSchema = (language) => {
  const msg = getValidationMessages(language);

  return yup.object().shape({
    name: yup
      .string()
      .required(msg.required)
      .min(2, msg.minLength)
      .max(100, msg.maxLength),
    email: yup
      .string()
      .required(msg.required)
      .email(msg.email),
    phone: yup
      .string()
      .required(msg.required)
      .matches(/^[+]?[\d\s-()]{8,}$/, msg.phone),
    subject: yup
      .string()
      .required(msg.required)
      .min(3, msg.minLength)
      .max(200, msg.maxLength),
    message: yup
      .string()
      .required(msg.required)
      .min(10, msg.minLength)
      .max(1000, msg.maxLength),
  });
};

// Booking form validation schema
export const getBookingSchema = (language) => {
  const msg = getValidationMessages(language);

  return yup.object().shape({
    // Customer info
    name: yup
      .string()
      .required(msg.required)
      .min(2, msg.minLength)
      .max(100, msg.maxLength),
    email: yup
      .string()
      .required(msg.required)
      .email(msg.email),
    phone: yup
      .string()
      .required(msg.required)
      .matches(/^[+]?[\d\s-()]{8,}$/, msg.phone),
    license: yup
      .string()
      .required(msg.required)
      .min(5, msg.minLength)
      .max(50, msg.maxLength),

    // Address
    street: yup
      .string()
      .required(msg.required)
      .min(3, msg.minLength)
      .max(200, msg.maxLength),
    city: yup
      .string()
      .required(msg.required)
      .min(2, msg.minLength)
      .max(100, msg.maxLength),
    area: yup
      .string()
      .max(100, msg.maxLength),
    postalCode: yup
      .string()
      .max(20, msg.maxLength),
    country: yup
      .string()
      .required(msg.required)
      .min(2, msg.minLength)
      .max(100, msg.maxLength),

    // Dates
    pickupDate: yup
      .string()
      .required(msg.required)
      .test('min-date', msg.minDate, function(value) {
        if (!value) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pickupDate = new Date(value);
        return pickupDate >= today;
      }),
    returnDate: yup
      .string()
      .required(msg.required)
      .test('date-order', msg.dateOrder, function(value) {
        const { pickupDate } = this.parent;
        if (!value || !pickupDate) return false;
        return new Date(value) > new Date(pickupDate);
      }),

    // Insurance
    insurance: yup
      .string()
      .required(msg.required),

    // Documents (will be validated separately as they are File objects)
    idDocument: yup
      .mixed()
      .required(msg.file)
      .test('fileSize', msg.fileSize, (value) => {
        if (!value) return false;
        return value.size <= 5242880; // 5MB
      })
      .test('fileType', msg.fileType, (value) => {
        if (!value) return false;
        return ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(value.type);
      }),
    passportDocument: yup
      .mixed()
      .required(msg.file)
      .test('fileSize', msg.fileSize, (value) => {
        if (!value) return false;
        return value.size <= 5242880; // 5MB
      })
      .test('fileType', msg.fileType, (value) => {
        if (!value) return false;
        return ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(value.type);
      }),
  });
};
