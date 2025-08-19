import { useState, useMemo } from 'react';
import { appData } from '../../../data.js';

/**
 * Hook personnalisé pour la gestion des filtres et du tri des références
 */
export const useReferencesFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPole, setSelectedPole] = useState('');
  const [selectedTypologie, setSelectedTypologie] = useState('');
  const [selectedObjet, setSelectedObjet] = useState('');
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [sortBy, setSortBy] = useState('annee');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filtrage des références
  const filteredReferences = useMemo(() => {
    return appData.references.filter(ref => 
      (!searchTerm || 
        ref.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.mots_cles.some(mot => mot.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (!selectedPole || ref.pole === selectedPole) &&
      (!selectedTypologie || ref.typologie === selectedTypologie) &&
      (!selectedObjet || ref.objet === selectedObjet) &&
      (!selectedAnnee || ref.annee.toString() === selectedAnnee) &&
      (!selectedStatut || ref.statut === selectedStatut)
    );
  }, [searchTerm, selectedPole, selectedTypologie, selectedObjet, selectedAnnee, selectedStatut]);

  // Tri des références
  const sortedReferences = useMemo(() => {
    return [...filteredReferences].sort((a, b) => {
      let comparison = 0;
      switch(sortBy) {
        case 'titre':
          comparison = a.titre.localeCompare(b.titre);
          break;
        case 'client':
          comparison = a.client.localeCompare(b.client);
          break;
        case 'annee':
          comparison = a.annee - b.annee;
          break;
        case 'budget':
          const budgetA = parseInt(a.budget.replace(/[€\s]/g, ''));
          const budgetB = parseInt(b.budget.replace(/[€\s]/g, ''));
          comparison = budgetA - budgetB;
          break;
        default:
          comparison = a.annee - b.annee;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredReferences, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return {
    // États des filtres
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
    
    // États du tri
    sortBy,
    sortOrder,
    toggleSort,
    
    // Données filtrées et triées
    sortedReferences
  };
};

export default useReferencesFilters;