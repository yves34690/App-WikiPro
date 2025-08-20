/**
 * Composant ConversationHistory - Historique avancé des conversations - WikiPro
 * Recherche full-text, filtres, export et gestion des sessions
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useConversations, EXPORT_FORMATS, SORT_TYPES } from '../hooks/useConversations';
import { MESSAGE_TYPES } from '../hooks/useAIChat';
import { getProviderIcon, getProviderColor } from '../services/aiProviders';

/**
 * Barre de recherche avec filtres
 */
const SearchBar = ({ 
  searchQuery, 
  onSearch, 
  onClear,
  isSearching,
  placeholder = "Rechercher dans les conversations..." 
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localQuery);
  };

  const handleClear = () => {
    setLocalQuery('');
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-8)' }}>
      <div style={{ 
        flex: 1, 
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <i 
          className="fas fa-search" 
          style={{ 
            position: 'absolute',
            left: '12px',
            color: 'var(--color-text-secondary)',
            fontSize: '14px'
          }} 
        />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 12px 10px 36px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: 'var(--font-size-sm)',
            background: 'var(--color-surface)',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
        />
        {localQuery && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSearching || !localQuery.trim()}
        style={{
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 16px',
          cursor: isSearching || !localQuery.trim() ? 'not-allowed' : 'pointer',
          fontSize: 'var(--font-size-sm)',
          fontWeight: '500',
          opacity: isSearching || !localQuery.trim() ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        {isSearching ? (
          <>
            <div className="loading-spinner" style={{ width: '14px', height: '14px' }} />
            Recherche...
          </>
        ) : (
          'Rechercher'
        )}
      </button>
    </form>
  );
};

/**
 * Filtres avancés
 */
const AdvancedFilters = ({ 
  filters, 
  sortBy,
  setSortBy,
  uniqueProviders,
  uniqueMessageTypes,
  onAddProviderFilter,
  onRemoveProviderFilter,
  onAddMessageTypeFilter,
  onRemoveMessageTypeFilter,
  onSetDateRange,
  onClearFilters,
  isExpanded,
  onToggleExpanded
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDateRangeApply = () => {
    if (startDate && endDate) {
      onSetDateRange(new Date(startDate), new Date(endDate));
    }
  };

  const hasActiveFilters = filters.providers.length > 0 || 
                          filters.messageTypes.length > 0 || 
                          filters.dateRange;

  return (
    <div style={{ 
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      background: 'var(--color-surface)'
    }}>
      {/* Header avec toggle */}
      <div
        onClick={onToggleExpanded}
        style={{
          padding: 'var(--space-12)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <i className="fas fa-filter" style={{ color: 'var(--color-text-secondary)' }}></i>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>
            Filtres avancés
          </span>
          {hasActiveFilters && (
            <span style={{
              background: 'var(--color-primary)',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              fontWeight: '500'
            }}>
              {filters.providers.length + filters.messageTypes.length + (filters.dateRange ? 1 : 0)}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-xs)',
                textDecoration: 'underline'
              }}
            >
              Effacer
            </button>
          )}
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ 
            color: 'var(--color-text-secondary)',
            fontSize: '12px'
          }}></i>
        </div>
      </div>

      {/* Contenu des filtres */}
      {isExpanded && (
        <div style={{ padding: 'var(--space-16)' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-16)'
          }}>
            {/* Tri */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '500',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-text-secondary)'
              }}>
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: 'var(--font-size-sm)',
                  background: 'var(--color-surface)'
                }}
              >
                <option value={SORT_TYPES.DATE_DESC}>Plus récents</option>
                <option value={SORT_TYPES.DATE_ASC}>Plus anciens</option>
                <option value={SORT_TYPES.PROVIDER}>Provider</option>
                <option value={SORT_TYPES.LENGTH}>Longueur</option>
              </select>
            </div>

            {/* Filtres par provider */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '500',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-text-secondary)'
              }}>
                Providers
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                {uniqueProviders.map(provider => (
                  <button
                    key={provider}
                    onClick={() => {
                      if (filters.providers.includes(provider)) {
                        onRemoveProviderFilter(provider);
                      } else {
                        onAddProviderFilter(provider);
                      }
                    }}
                    style={{
                      background: filters.providers.includes(provider) 
                        ? getProviderColor(provider) 
                        : 'var(--color-bg-subtle)',
                      color: filters.providers.includes(provider) 
                        ? 'white' 
                        : 'var(--color-text-primary)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '4px 8px',
                      fontSize: 'var(--font-size-xs)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{getProviderIcon(provider)}</span>
                    {provider}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtres par type de message */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '500',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-text-secondary)'
              }}>
                Types de message
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                {uniqueMessageTypes.map(type => {
                  const isSelected = filters.messageTypes.includes(type);
                  const getTypeIcon = (type) => {
                    switch (type) {
                      case MESSAGE_TYPES.USER: return '👤';
                      case MESSAGE_TYPES.ASSISTANT: return '🤖';
                      case MESSAGE_TYPES.SYSTEM: return '⚙️';
                      case MESSAGE_TYPES.ERROR: return '❌';
                      default: return '💬';
                    }
                  };

                  return (
                    <button
                      key={type}
                      onClick={() => {
                        if (isSelected) {
                          onRemoveMessageTypeFilter(type);
                        } else {
                          onAddMessageTypeFilter(type);
                        }
                      }}
                      style={{
                        background: isSelected ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                        color: isSelected ? 'white' : 'var(--color-text-primary)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '4px 8px',
                        fontSize: 'var(--font-size-xs)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{getTypeIcon(type)}</span>
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtre par date */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '500',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-text-secondary)'
              }}>
                Période
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '6px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    fontSize: 'var(--font-size-xs)',
                    background: 'var(--color-surface)'
                  }}
                />
                <span style={{ color: 'var(--color-text-secondary)' }}>à</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '6px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    fontSize: 'var(--font-size-xs)',
                    background: 'var(--color-surface)'
                  }}
                />
                <button
                  onClick={handleDateRangeApply}
                  disabled={!startDate || !endDate}
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: 'var(--font-size-xs)',
                    cursor: !startDate || !endDate ? 'not-allowed' : 'pointer',
                    opacity: !startDate || !endDate ? 0.5 : 1
                  }}
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Liste des conversations avec sélection
 */
const ConversationList = ({ 
  conversations, 
  selectedConversations,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  isLoading 
}) => {
  const formatMessagePreview = (message, maxLength = 100) => {
    return message.length > maxLength 
      ? message.substring(0, maxLength) + '...'
      : message;
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case MESSAGE_TYPES.USER: return '👤';
      case MESSAGE_TYPES.ASSISTANT: return '🤖';
      case MESSAGE_TYPES.SYSTEM: return '⚙️';
      case MESSAGE_TYPES.ERROR: return '❌';
      default: return '💬';
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 'var(--space-24)',
        color: 'var(--color-text-secondary)'
      }}>
        <div className="loading-spinner" style={{ marginRight: '8px' }} />
        Chargement des conversations...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-24)',
        color: 'var(--color-text-secondary)'
      }}>
        <i className="fas fa-comments" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
        <p style={{ margin: 0 }}>Aucune conversation trouvée</p>
      </div>
    );
  }

  const allSelected = conversations.length > 0 && 
                      conversations.every(conv => selectedConversations.includes(conv.id));
  const someSelected = selectedConversations.length > 0;

  return (
    <div>
      {/* Header de sélection */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-12)',
        background: 'var(--color-bg-subtle)',
        borderRadius: '8px',
        marginBottom: 'var(--space-12)',
        fontSize: 'var(--font-size-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={allSelected ? onClearSelection : onSelectAll}
            style={{ cursor: 'pointer' }}
          />
          <span>
            {selectedConversations.length > 0 
              ? `${selectedConversations.length} sélectionnée(s)`
              : `${conversations.length} conversation(s)`
            }
          </span>
        </div>
        
        {someSelected && (
          <button
            onClick={onClearSelection}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-xs)',
              textDecoration: 'underline'
            }}
          >
            Désélectionner tout
          </button>
        )}
      </div>

      {/* Liste des conversations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {conversations.map(conversation => {
          const isSelected = selectedConversations.includes(conversation.id);
          const provider = conversation.metadata?.provider;
          const providerColor = provider ? getProviderColor(provider) : '#6b7280';

          return (
            <div
              key={conversation.id}
              onClick={() => onToggleSelection(conversation.id)}
              style={{
                padding: 'var(--space-12)',
                border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: '8px',
                background: isSelected ? 'var(--color-primary)05' : 'var(--color-surface)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                gap: 'var(--space-12)',
                alignItems: 'flex-start'
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}} // Géré par le onClick du parent
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />

              {/* Icône de type */}
              <div style={{ 
                fontSize: '16px', 
                marginTop: '2px',
                flexShrink: 0
              }}>
                {getMessageTypeIcon(conversation.type)}
              </div>

              {/* Contenu */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header avec provider et date */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-8)',
                  marginBottom: 'var(--space-4)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)'
                }}>
                  {provider && (
                    <>
                      <span style={{ color: providerColor, fontWeight: '500' }}>
                        {getProviderIcon(provider)} {provider}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>{new Date(conversation.created_at).toLocaleString('fr-FR')}</span>
                  {conversation.metadata?.tokens && (
                    <>
                      <span>•</span>
                      <span>{conversation.metadata.tokens} tokens</span>
                    </>
                  )}
                </div>

                {/* Aperçu du message */}
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.4
                }}>
                  {formatMessagePreview(conversation.message || '')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Section d'export
 */
const ExportSection = ({ 
  selectedConversations, 
  onDownloadExport,
  hasSelection 
}) => {
  const [exportFormat, setExportFormat] = useState(EXPORT_FORMATS.MARKDOWN);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!hasSelection) return;
    
    setIsExporting(true);
    try {
      await onDownloadExport(exportFormat);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{
      padding: 'var(--space-16)',
      background: 'var(--color-bg-subtle)',
      borderRadius: '8px',
      border: '1px solid var(--color-border)'
    }}>
      <h4 style={{ 
        margin: '0 0 var(--space-12) 0',
        fontSize: 'var(--font-size-base)',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-8)'
      }}>
        <i className="fas fa-download" style={{ color: 'var(--color-text-secondary)' }}></i>
        Export des conversations
      </h4>

      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-12)',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--font-size-xs)',
            fontWeight: '500',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text-secondary)'
          }}>
            Format d'export
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: 'var(--font-size-sm)',
              background: 'var(--color-surface)'
            }}
          >
            <option value={EXPORT_FORMATS.MARKDOWN}>Markdown (.md)</option>
            <option value={EXPORT_FORMATS.JSON}>JSON (.json)</option>
            <option value={EXPORT_FORMATS.TXT}>Texte (.txt)</option>
            <option value={EXPORT_FORMATS.HTML}>HTML (.html)</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          disabled={!hasSelection || isExporting}
          style={{
            background: hasSelection ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            cursor: !hasSelection || isExporting ? 'not-allowed' : 'pointer',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: !hasSelection || isExporting ? 0.5 : 1
          }}
        >
          {isExporting ? (
            <>
              <div className="loading-spinner" style={{ width: '14px', height: '14px' }} />
              Export...
            </>
          ) : (
            <>
              <i className="fas fa-download"></i>
              Exporter ({selectedConversations.length})
            </>
          )}
        </button>
      </div>

      {!hasSelection && (
        <p style={{
          margin: 'var(--space-8) 0 0 0',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)'
        }}>
          Sélectionnez des conversations pour activer l'export
        </p>
      )}
    </div>
  );
};

/**
 * Composant principal ConversationHistory
 */
const ConversationHistory = ({ 
  sessionId,
  className = '',
  enableExport = true,
  enableFilters = true 
}) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const {
    conversations,
    selectedConversations,
    isLoading,
    isSearching,
    searchQuery,
    filters,
    sortBy,
    setSortBy,
    searchConversations,
    clearSearch,
    addProviderFilter,
    removeProviderFilter,
    addMessageTypeFilter,
    removeMessageTypeFilter,
    setDateRangeFilter,
    clearFilters,
    toggleConversationSelection,
    selectAllDisplayed,
    clearSelection,
    downloadExport,
    getUniqueProviders,
    getUniqueMessageTypes,
    getConversationStats,
    hasSelection,
    filteredCount,
    totalCount
  } = useConversations({ 
    sessionId,
    autoLoad: true,
    enableSearch: true 
  });

  // Statistiques
  const stats = useMemo(() => getConversationStats(), [getConversationStats]);
  const uniqueProviders = useMemo(() => getUniqueProviders(), [getUniqueProviders]);
  const uniqueMessageTypes = useMemo(() => getUniqueMessageTypes(), [getUniqueMessageTypes]);

  return (
    <div className={`conversation-history ${className}`} style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      gap: 'var(--space-16)'
    }}>
      {/* Header avec statistiques */}
      <div style={{
        padding: 'var(--space-16)',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 'var(--space-12)'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)'
          }}>
            <i className="fas fa-history" style={{ color: 'var(--color-text-secondary)' }}></i>
            Historique des conversations
          </h3>
          
          <div style={{ 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)'
          }}>
            {filteredCount !== totalCount ? (
              <span>{filteredCount} sur {totalCount} conversations</span>
            ) : (
              <span>{totalCount} conversation(s)</span>
            )}
          </div>
        </div>

        {/* Statistiques rapides */}
        {stats.total > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--space-12)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)'
          }}>
            <div>
              <span style={{ fontWeight: '500' }}>Total tokens:</span>
              <span style={{ marginLeft: '4px' }}>{stats.totalTokens.toLocaleString()}</span>
            </div>
            <div>
              <span style={{ fontWeight: '500' }}>Longueur moyenne:</span>
              <span style={{ marginLeft: '4px' }}>{stats.averageLength} chars</span>
            </div>
            {stats.dateRange && (
              <div>
                <span style={{ fontWeight: '500' }}>Période:</span>
                <span style={{ marginLeft: '4px' }}>
                  {stats.dateRange.start.toLocaleDateString('fr-FR')} - {stats.dateRange.end.toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barre de recherche */}
      <SearchBar
        searchQuery={searchQuery}
        onSearch={searchConversations}
        onClear={clearSearch}
        isSearching={isSearching}
      />

      {/* Filtres avancés */}
      {enableFilters && uniqueProviders.length > 0 && (
        <AdvancedFilters
          filters={filters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          uniqueProviders={uniqueProviders}
          uniqueMessageTypes={uniqueMessageTypes}
          onAddProviderFilter={addProviderFilter}
          onRemoveProviderFilter={removeProviderFilter}
          onAddMessageTypeFilter={addMessageTypeFilter}
          onRemoveMessageTypeFilter={removeMessageTypeFilter}
          onSetDateRange={setDateRangeFilter}
          onClearFilters={clearFilters}
          isExpanded={filtersExpanded}
          onToggleExpanded={() => setFiltersExpanded(!filtersExpanded)}
        />
      )}

      {/* Liste des conversations */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <ConversationList
          conversations={conversations}
          selectedConversations={selectedConversations}
          onToggleSelection={toggleConversationSelection}
          onSelectAll={selectAllDisplayed}
          onClearSelection={clearSelection}
          isLoading={isLoading}
        />
      </div>

      {/* Section d'export */}
      {enableExport && totalCount > 0 && (
        <ExportSection
          selectedConversations={selectedConversations}
          onDownloadExport={downloadExport}
          hasSelection={hasSelection}
        />
      )}
    </div>
  );
};

export default ConversationHistory;