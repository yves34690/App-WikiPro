import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour la gestion du thème clair/sombre
 * @returns {Object} { theme, toggleTheme }
 */
export const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};

export default useTheme;