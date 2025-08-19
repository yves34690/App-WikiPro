import { render, screen } from '@testing-library/react';
import App from './App';

test('renders WikiPro application', () => {
  render(<App />);
  const headerElement = screen.getByText('Groupe Elan');
  expect(headerElement).toBeInTheDocument();
});

test('renders navigation with Vue d\'ensemble tab', () => {
  render(<App />);
  const dashboardTab = screen.getByText(/Vue d'ensemble/i);
  expect(dashboardTab).toBeInTheDocument();
});
