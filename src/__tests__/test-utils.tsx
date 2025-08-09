import { render as rtlRender } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { AppAuthProvider } from '@/contexts/AppAuthContext';
import '@testing-library/jest-dom';

function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => <AppAuthProvider>{children}</AppAuthProvider>,
    ...options,
  });
}

// re-export everything
export * from '@testing-library/react';
export { screen };
export { render }; 