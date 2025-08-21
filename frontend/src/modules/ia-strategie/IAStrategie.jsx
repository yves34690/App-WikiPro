import React, { useState } from 'react';
import { ChatInterface } from './components';
import { useIAStrategie } from './hooks/useIAStrategie';
import { appData } from '../../data.js';

/**
 * Module IAStrategie - Interface Chat IA WikiPro avec Backend Multi-Provider
 * Intègre ChatGPT-like interface avec WebSocket streaming
 */
const IAStrategie = () => {
  const [showLegacyMode, setShowLegacyMode] = useState(false);
  
  // Hook legacy pour compatibilité
  const {
    selectedModel,
    setSelectedModel,
    inputText,
    setInputText,
    showCanvas,
    setShowCanvas,
    canvasContent,
    setCanvasContent,
    isGenerating,
    aiModels,
    handleGenerate,
    handleKeyPress
  } = useIAStrategie();
  // eslint-disable-next-line no-unused-vars
  const dataConnectors = {
    references: `Données disponibles : ${appData.references.length} références d'études`,
    competences: `${appData.competences.length} compétences répertoriées`,
    poles: `${appData.poles.labels.length} pôles d'expertise actifs`,
    budget: `Budget total : ${Math.round(appData.references.reduce((acc, r) => acc + parseInt(r.budget.replace(/[€\s]/g, '')), 0) / 1000)}K€`
  };

  // Mode de rendu : nouvelle interface Chat ou legacy
  if (showLegacyMode) {
    // Interface legacy (code original conservé pour compatibilité)
    return (
      <div style={{ height: '100vh', display: 'flex', backgroundColor: 'var(--color-bg-subtle)' }}>
        {/* Zone de saisie principale */}
        <div style={{ flex: showCanvas ? '1' : '1', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)', borderRight: showCanvas ? '1px solid var(--color-border)' : 'none' }}>

          {/* Header avec bandeau coloré */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal-400) 50%, var(--color-teal-600) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Motif décoratif en arrière-plan */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
              pointerEvents: 'none'
            }}></div>

            <div style={{
              padding: 'var(--space-24)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <i className="fas fa-brain" style={{ color: 'white', fontSize: '20px' }}></i>
                  </div>
                  <h2 style={{
                    margin: '0',
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: '600',
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    letterSpacing: '-0.025em'
                  }}>
                    Studio d'IA WikiPro (Legacy)
                  </h2>
                </div>

                {/* Bouton pour basculer vers le nouveau mode */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                  <button
                    onClick={() => setShowLegacyMode(false)}
                    style={{
                      padding: 'var(--space-8) var(--space-16)',
                      backgroundColor: 'var(--color-success)',
                      border: 'none',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-sm)',
                      color: 'white',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <i className="fas fa-comments"></i> Chat Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Interface legacy réduite */}
            <div style={{ padding: 'var(--space-20)', textAlign: 'center' }}>
              <p style={{ color: 'white', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-16)' }}>
                Mode Legacy - Cliquez sur "Chat Mode" pour utiliser la nouvelle interface ChatGPT-like
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Nouvelle interface ChatGPT-like par défaut
  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* Bouton pour basculer vers legacy (pour tests) */}
      <button
        onClick={() => setShowLegacyMode(true)}
        style={{
          position: 'fixed',
          top: 'var(--space-20)',
          right: 'var(--space-20)',
          zIndex: 1001,
          padding: 'var(--space-8) var(--space-12)',
          backgroundColor: 'var(--color-bg-muted)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          fontWeight: '500',
          transition: 'all 0.2s',
          opacity: 0.7
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.backgroundColor = 'var(--color-primary)';
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.7';
          e.target.style.backgroundColor = 'var(--color-bg-muted)';
          e.target.style.color = 'var(--color-text-muted)';
        }}
      >
        <i className="fas fa-cog"></i> Legacy Mode
      </button>

      {/* Interface Chat principale */}
      <ChatInterface />
    </div>
  );
};

export default IAStrategie;