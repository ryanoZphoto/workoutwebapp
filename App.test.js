import { render, screen } from '@testing-library/react';
import App from './App';
import { AppProvider } from './context/AppContext';

test('renders app heading', () => {
  render(
    <AppProvider>
      <App />
    </AppProvider>
  );
  const headingElement = screen.getByText(/Weekly Fitness Tracker/i);
  expect(headingElement).toBeInTheDocument();
});
