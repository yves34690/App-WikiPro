import React from 'react';
import { FiltersSection, SortControls, ReferenceCard, NoResults } from './components';
import { useReferencesFilters } from './hooks/useReferencesFilters';

/**
 * Module References - Gestion et affichage des références d'études
 * Fonctionnalités : recherche, filtrage multi-critères, tri, affichage détaillé
 */
const References = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedPole,
    setSelectedPole,
    selectedTypologie,
    setSelectedTypologie,
    selectedObjet,
    setSelectedObjet,
    selectedAnnee,
    setSelectedAnnee,
    selectedStatut,
    setSelectedStatut,
    sortBy,
    sortOrder,
    toggleSort,
    sortedReferences
  } = useReferencesFilters();

  return (
    <>
      <FiltersSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedPole={selectedPole}
        setSelectedPole={setSelectedPole}
        selectedTypologie={selectedTypologie}
        setSelectedTypologie={setSelectedTypologie}
        selectedObjet={selectedObjet}
        setSelectedObjet={setSelectedObjet}
        selectedAnnee={selectedAnnee}
        setSelectedAnnee={setSelectedAnnee}
        selectedStatut={selectedStatut}
        setSelectedStatut={setSelectedStatut}
      />

      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <SortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              toggleSort={toggleSort}
              resultsCount={sortedReferences.length}
            />

            <div className="methodologies-grid">
              {sortedReferences.map(reference => (
                <ReferenceCard key={reference.id} reference={reference} />
              ))}
            </div>

            {sortedReferences.length === 0 && <NoResults />}
          </div>
        </div>
      </div>
    </>
  );
};

export default References;