/**
 * Mock de Chart.js pour les tests Jest
 * Évite les erreurs de canvas et simule le comportement des charts
 */

// Mock des composants Chart.js
export const Chart = jest.fn(() => ({
  destroy: jest.fn(),
  update: jest.fn(),
  render: jest.fn()
}));

export const Line = jest.fn(({ data, options }) => {
  return {
    type: 'line',
    data,
    options,
    destroy: jest.fn(),
    update: jest.fn()
  };
});

export const Doughnut = jest.fn(({ data, options }) => {
  return {
    type: 'doughnut', 
    data,
    options,
    destroy: jest.fn(),
    update: jest.fn()
  };
});

export const Bar = jest.fn(({ data, options }) => {
  return {
    type: 'bar',
    data,
    options,
    destroy: jest.fn(),
    update: jest.fn()
  };
});

export const Pie = jest.fn(({ data, options }) => {
  return {
    type: 'pie',
    data,
    options,
    destroy: jest.fn(),
    update: jest.fn()
  };
});

export const Radar = jest.fn(({ data, options }) => {
  return {
    type: 'radar',
    data,
    options,
    destroy: jest.fn(),
    update: jest.fn()
  };
});

// Mock des éléments Chart.js
export const CategoryScale = {};
export const LinearScale = {};
export const PointElement = {};
export const LineElement = {};
export const Title = {};
export const Tooltip = {};
export const Legend = {};
export const ArcElement = {};
export const BarElement = {};
export const RadialLinearScale = {};

// Mock du registre Chart.js
Chart.register = jest.fn();

export default Chart;