import { useState } from 'react';

/**
 * Hook personnalisé pour la gestion des filtres des mots-clés
 */
export const useMotsClesFilters = () => {
  const [categorieFilter, setCategorieFilter] = useState('');
  const [poleFilter, setPoleFilter] = useState('');
  const [typologieFilter, setTypologieFilter] = useState('');

  return {
    categorieFilter,
    setCategorieFilter,
    poleFilter,
    setPoleFilter,
    typologieFilter,
    setTypologieFilter
  };
};

export default useMotsClesFilters;