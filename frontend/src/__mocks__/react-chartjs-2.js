/**
 * Mock de react-chartjs-2 pour les tests Jest
 * Simule les composants Chart sans rendu canvas
 */

import React from 'react';

// Mock des composants react-chartjs-2
export const Line = jest.fn(({ data, options, ...props }) => (
  <div 
    data-testid="line-chart" 
    data-chart-type="line"
    data-chart-data={JSON.stringify(data)}
    {...props}
  >
    Line Chart Mock
  </div>
));

export const Doughnut = jest.fn(({ data, options, ...props }) => (
  <div 
    data-testid="doughnut-chart" 
    data-chart-type="doughnut"
    data-chart-data={JSON.stringify(data)}
    {...props}
  >
    Doughnut Chart Mock
  </div>
));

export const Bar = jest.fn(({ data, options, ...props }) => (
  <div 
    data-testid="bar-chart" 
    data-chart-type="bar"
    data-chart-data={JSON.stringify(data)}
    {...props}
  >
    Bar Chart Mock
  </div>
));

export const Pie = jest.fn(({ data, options, ...props }) => (
  <div 
    data-testid="pie-chart" 
    data-chart-type="pie"
    data-chart-data={JSON.stringify(data)}
    {...props}
  >
    Pie Chart Mock
  </div>
));

export const Radar = jest.fn(({ data, options, ...props }) => (
  <div 
    data-testid="radar-chart" 
    data-chart-type="radar"
    data-chart-data={JSON.stringify(data)}
    {...props}
  >
    Radar Chart Mock
  </div>
));

// Reset des mocks après chaque test
beforeEach(() => {
  Line.mockClear();
  Doughnut.mockClear();
  Bar.mockClear();
  Pie.mockClear();
  Radar.mockClear();
});