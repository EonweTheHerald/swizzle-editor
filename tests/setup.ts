import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IndexedDB for tests
const indexedDB = {
  open: () => ({
    result: {},
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
  }),
};

global.indexedDB = indexedDB as any;
