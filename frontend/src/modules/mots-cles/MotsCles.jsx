import React from 'react';
import { FiltersSection, WordCloud, HeatmapChart } from './components';
import { useMotsClesFilters } from './hooks/useMotsClesFilters';

/**
 * Module MotsCles - Gestion et visualisation des mots-clés
 * Fonctionnalités : filtrage, nuage de mots, heatmap de densité
 */
const MotsCles = () => {
  const {
    categorieFilter,
    setCategorieFilter,
    poleFilter,
    setPoleFilter,
    typologieFilter,
    setTypologieFilter
  } = useMotsClesFilters();

  return (
    <>
      <FiltersSection
        categorieFilter={categorieFilter}
        setCategorieFilter={setCategorieFilter}
        poleFilter={poleFilter}
        setPoleFilter={setPoleFilter}
        typologieFilter={typologieFilter}
        setTypologieFilter={setTypologieFilter}
      />
      <div className="charts-grid">
        <WordCloud 
          selectedCategory={categorieFilter} 
          selectedPole={poleFilter} 
          selectedTypologie={typologieFilter} 
        />
        <HeatmapChart />
      </div>
    </>
  );
};

export default MotsCles;