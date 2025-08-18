import React from 'react';
import { appData } from '../../../data.js';

/**
 * Composant WordCloud - Nuage de mots-clés interactif avec filtrage
 */
const WordCloud = ({ selectedCategory, selectedPole, selectedTypologie }) => {
  let allWords = [];
  let filterInfo = [];
  
  // Build filter information for display
  if (selectedCategory) filterInfo.push(`Catégorie: ${selectedCategory}`);
  if (selectedPole) filterInfo.push(`Pôle: ${selectedPole}`);
  if (selectedTypologie) filterInfo.push(`Typologie: ${selectedTypologie}`);
  
  if (selectedCategory) {
    const categoryData = appData.mots_cles_par_categorie[selectedCategory];
    if (categoryData) {
      allWords = categoryData.labels.map((word, index) => ({
        word: word,
        value: categoryData.values[index],
        category: selectedCategory
      }));
    }
  } else {
    Object.keys(appData.mots_cles_par_categorie).forEach(category => {
      appData.mots_cles_par_categorie[category].labels.forEach((word, index) => {
        allWords.push({
          word: word,
          value: appData.mots_cles_par_categorie[category].values[index],
          category: category
        });
      });
    });
  }

  // Apply pole and typologie filters (for future implementation when data is available)
  // Currently showing all words as the data structure doesn't have pole/typologie mapping
  if (selectedPole || selectedTypologie) {
    // For now, we keep all words but show filter information
    // In a real implementation, this would filter based on pole/typologie relationships
  }

  allWords.sort((a, b) => b.value - a.value);

  return (
    <div className="card chart-container">
      <div className="card__body">
        <h3>Nuage de mots-clés</h3>
        {filterInfo.length > 0 && (
          <div className="filter-info" style={{marginBottom: '15px', fontSize: '14px', color: '#666'}}>
            Filtres actifs: {filterInfo.join(' | ')}
          </div>
        )}
        <div id="wordCloud" className="word-cloud">
          {allWords.length > 0 ? (
            allWords.map(item => (
              <span
                key={item.word}
                className={`word-item word-size-${Math.min(5, Math.max(1, Math.floor(item.value / 5) + 1))}`}
                title={`${item.category}: ${item.value} occurrences`}
              >
                {item.word}
              </span>
            ))
          ) : (
            <p style={{textAlign: 'center', color: '#999', padding: '20px'}}>
              Aucun mot-clé trouvé pour les filtres sélectionnés
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordCloud;