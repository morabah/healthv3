/**
 * Jest Setup File
 * Configures the test environment with necessary mocks
 */

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock fetch for Firebase Auth
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'basic' as ResponseType,
    url: 'https://mock.com',
    clone: () => Promise.resolve({} as Response),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
  } as Response)
);

// Initialize Firebase fetch provider
jest.mock('firebase/auth', () => {
  const originalModule = jest.requireActual('firebase/auth');
  
  // Mock the FetchProvider initialization
  if (originalModule.FetchProvider && originalModule.FetchProvider.initialize) {
    originalModule.FetchProvider.initialize(global.fetch);
  }
  
  return {
    ...originalModule,
    getAuth: jest.fn(() => ({
      currentUser: null,
      onAuthStateChanged: jest.fn(),
      signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-user-id' } })),
      createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-user-id' } })),
      signOut: jest.fn(() => Promise.resolve()),
    })),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-user-id' } })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-user-id' } })),
    signOut: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn(),
  };
});

// Mock console.error to catch React warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress specific React warnings that might occur during testing
  const suppressedWarnings = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: useLayoutEffect does nothing on the server',
    '@firebase/auth: Auth',
  ];
  
  // Check if the warning should be suppressed
  const shouldSuppress = suppressedWarnings.some(warning => 
    args.some(arg => typeof arg === 'string' && arg.includes(warning))
  );
  
  if (!shouldSuppress) {
    originalConsoleError(...args);
  }
};

// Mock Firebase environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'mock-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'mock-auth-domain';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'mock-project-id';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'mock-storage-bucket';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'mock-messaging-sender-id';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'mock-app-id';
process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'mock-measurement-id';

// Global afterEach to clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
