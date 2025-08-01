// API Configuration
export const API_CONFIG = {
  // URL lokale për zhvillim
  LOCAL: 'http://192.168.50.173:3000',
  // URL e largët për produksion
  PRODUCTION: 'https://joraapp.onrender.com',
};

// Përdor URL lokale nëse jemi në development mode, përndryshe përdor production
export const API_BASE = __DEV__ ? API_CONFIG.LOCAL : API_CONFIG.PRODUCTION;

// Helper function për të marrë URL-në e plotë për një endpoint
export const getApiUrl = (endpoint: string) => `${API_BASE}${endpoint}`;

// Endpoints të zakonshëm
export const ENDPOINTS = {
  REGISTER: '/api/register',
  LOGIN: '/api/login',
  USERS: '/api/users',
  USERS_ADMIN: '/api/users/admin',
  NOTIFY: '/api/notify',
  TEST_NOTIFICATION: '/api/test-notification',
  PDFS: '/api/pdfs',
  UPLOAD_PDF: '/api/upload-pdf',
  USER_PUSH_TOKEN: '/api/user/push-token',
  STORE_TOKEN: '/api/store-token',
  USER_ADDRESS: '/api/user/address',
  USER_PHOTO: '/api/user/photo',
  USER_PASSWORD: '/api/user/password',
  USER_ROLE: '/api/user/role',
  BARCODE: (barcode: string) => `/api/barcode/${barcode}`,
  PDF: (id: string) => `/api/pdf/${id}`,
  USER: (firstName: string) => `/api/user/${firstName}`,
  PRODUCTS: '/api/products',
}; 