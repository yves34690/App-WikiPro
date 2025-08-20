/**
 * Module References avec intégration API - WikiPro
 * Version migrée utilisant les hooks API pour récupérer et filtrer les références
 */

import React, { useState, useMemo } from 'react';
import { 
  LoadingState, 
  ErrorState,
  EmptyState,
  SkeletonList,
  SkeletonCard 
} from '../../components/common';
import { useReferences } from '../../hooks/api';
import { FiltersSection, SortControls, ReferenceCard, NoResults } from './components';

/**
 * Composant References avec API
 */
const References = () => {
  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPole, setSelectedPole] = useState('');
  const [selectedTypologie, setSelectedTypologie] = useState('');
  const [selectedObjet, setSelectedObjet] = useState('');
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Construction des filtres pour l'API
  const apiFilters = useMemo(() => ({
    search: searchTerm || undefined,
    pole: selectedPole || undefined,
    typologie: selectedTypologie || undefined,
    objet: selectedObjet || undefined,
    annee: selectedAnnee || undefined,
    statut: selectedStatut || undefined,
    sortBy,
    sortOrder,
  }), [searchTerm, selectedPole, selectedTypologie, selectedObjet, selectedAnnee, selectedStatut, sortBy, sortOrder]);

  // Hook API pour récupérer les références
  const {
    data: referencesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useReferences(apiFilters, {
    keepPreviousData: true, // Garde les données précédentes pendant le rechargement
    staleTime: 30 * 1000, // 30 secondes
  });

  // Fonction de tri
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Fonction de reset des filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedPole('');
    setSelectedTypologie('');
    setSelectedObjet('');
    setSelectedAnnee('');
    setSelectedStatut('');
    setSortBy('date');
    setSortOrder('desc');
  };

  // Gestion du chargement initial
  if (isLoading && !referencesData) {
    return (
      <div className="references-loading">
        {/* Skeleton pour les filtres */}
        <div className="filters-skeleton">
          <SkeletonCard height="120px" showImage={false} lines={3} />
        </div>
        
        {/* Skeleton pour la liste */}
        <div className="references-list-skeleton">
          <SkeletonList items={8} height="120px" />
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <ErrorState
        title="Erreur de chargement des références"
        message="Impossible de récupérer les références d'études"
        error={process.env.NODE_ENV === 'development' ? error : null}
        showDetails={process.env.NODE_ENV === 'development'}
        onRetry={refetch}
      />
    );
  }

  const references = referencesData?.references || [];
  const totalCount = referencesData?.total || 0;
  const availableFilters = referencesData?.filters || {};

  // Gestion des résultats vides
  const hasFilters = searchTerm || selectedPole || selectedTypologie || selectedObjet || selectedAnnee || selectedStatut;
  
  if (references.length === 0 && !isLoading) {
    if (hasFilters) {
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
            availableFilters={availableFilters}
            isLoading={isRefetching}
            onReset={resetFilters}
          />
          <NoResults 
            searchTerm={searchTerm}
            hasFilters={hasFilters}
            onReset={resetFilters}
          />
        </>
      );
    }
    
    return (
      <EmptyState
        icon="fas fa-folder-open"
        title="Aucune référence disponible"
        message="Il n'y a pas encore de références d'études dans ce tenant"
        action={
          <button 
            className="btn-primary"
            onClick={refetch}
            type="button"
          >
            <i className="fas fa-redo"></i>
            Actualiser
          </button>
        }
      />
    );
  }

  return (
    <div className="references-with-api">
      {/* Section des filtres */}
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
        availableFilters={availableFilters}
        isLoading={isRefetching}
        onReset={resetFilters}
        totalCount={totalCount}
      />

      {/* Section des résultats */}
      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            {/* Contrôles de tri et stats */}
            <div className="references-header">
              <div className="results-summary">
                <h3>
                  <i className="fas fa-folder-open"></i>
                  Références d'études
                  <span className="count">({references.length}{totalCount > references.length ? `/${totalCount}` : ''})</span>
                </h3>
                {hasFilters && (
                  <button 
                    className="clear-filters-btn"
                    onClick={resetFilters}
                    type="button"
                  >
                    <i className="fas fa-times"></i>
                    Effacer les filtres
                  </button>
                )}
              </div>

              <SortControls
                sortBy={sortBy}
                sortOrder={sortOrder}
                toggleSort={toggleSort}
                isLoading={isRefetching}
              />
            </div>

            {/* Indicateur de chargement en cours */}
            {isRefetching && (
              <div className="refetch-indicator">
                <LoadingState type="spinner" size="small" />
                <span>Mise à jour des résultats...</span>
              </div>
            )}

            {/* Liste des références */}
            <div className="references-list">
              {references.map((reference, index) => (
                <div key={reference.id || index} className="reference-item">
                  <ReferenceCard 
                    reference={reference}
                    searchTerm={searchTerm}
                  />
                </div>
              ))}
            </div>

            {/* Informations de pagination si disponibles */}
            {referencesData?.pagination && (
              <div className="pagination-info">
                <span>
                  Affichage de {referencesData.pagination.offset + 1} à {Math.min(referencesData.pagination.offset + referencesData.pagination.limit, totalCount)} sur {totalCount} résultats
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton de rechargement flottant */}
      <button
        className="floating-refresh-btn"
        onClick={refetch}
        title="Actualiser les références"
        disabled={isLoading || isRefetching}
      >
        <i className={`fas fa-sync-alt ${(isLoading || isRefetching) ? 'fa-spin' : ''}`}></i>
      </button>
    </div>
  );
};

export default References;