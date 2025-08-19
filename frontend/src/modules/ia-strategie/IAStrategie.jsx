import { appData } from '../../data.js';
import { useIAStrategie } from './hooks/useIAStrategie';

/**
 * Module IAStrategie - Interface de Rédaction IA WikiPro - Style Gemini épuré
 */
const IAStrategie = () => {
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
                  Studio d'IA WikiPro
                </h2>
              </div>

              {/* Sélecteur IA avec couleurs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    padding: 'var(--space-8) var(--space-12)',
                    border: '2px solid var(--color-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer',
                    color: 'var(--color-text-primary)',
                    fontWeight: '500',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {aiModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.icon} {model.name}
                    </option>
                  ))}
                </select>

                {showCanvas && (
                  <button
                    onClick={() => setShowCanvas(false)}
                    style={{
                      padding: 'var(--space-8)',
                      backgroundColor: 'var(--color-error)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      color: 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Zone de saisie centrale */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--space-32)', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '700px', textAlign: 'center' }}>
              <h3 style={{ marginBottom: 'var(--space-24)', fontSize: 'var(--font-size-xl)', fontWeight: '600', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                Que souhaitez-vous créer aujourd'hui ?
              </h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Décrivez le document que vous souhaitez générer...

Exemples :
• Rédiger un rapport de synthèse sur nos activités 2024
• Créer une proposition commerciale pour un projet de ZAE
• Analyser les tendances de nos études par pôle
• Générer un plan de communication territorial

Utilisez Ctrl+Entrée pour générer"
                disabled={isGenerating}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: 'var(--space-20)',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-base)',
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-16)', textAlign: 'left' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-8)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'white'
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-success)',
                    boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)'
                  }}></div>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'white' }}>
                    Connecté aux données WikiPro • {aiModels.find(m => m.id === selectedModel)?.name}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                  {showCanvas && (
                    <button
                      onClick={() => setShowCanvas(false)}
                      style={{
                        padding: 'var(--space-8) var(--space-16)',
                        backgroundColor: 'var(--color-warning)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-sm)',
                        color: 'white',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        boxShadow: 'var(--shadow-xs)'
                      }}
                    >
                      <i className="fas fa-eye-slash"></i> Masquer Canvas
                    </button>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={!inputText.trim() || isGenerating}
                    style={{
                      padding: 'var(--space-12) var(--space-24)',
                      backgroundColor: inputText.trim() && !isGenerating ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-lg)',
                      cursor: inputText.trim() && !isGenerating ? 'pointer' : 'not-allowed',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-8)',
                      boxShadow: inputText.trim() && !isGenerating ? '0 4px 12px rgba(20, 184, 166, 0.3)' : 'none',
                      transform: inputText.trim() && !isGenerating ? 'translateY(-1px)' : 'none'
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic"></i>
                        Générer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas de rédaction */}
        {showCanvas && (
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)', borderLeft: '3px solid var(--color-primary)' }}>
            <div style={{
              padding: 'var(--space-16)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-teal-400) 100%)',
              color: 'white'
            }}>
              <h3 style={{ margin: '0', fontSize: 'var(--font-size-lg)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-edit" style={{ fontSize: '14px' }}></i>
                </div>
                Canvas de rédaction
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                <button style={{
                  padding: 'var(--space-8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s'
                }}>
                  <i className="fas fa-copy"></i>
                </button>
                <button style={{
                  padding: 'var(--space-8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s'
                }}>
                  <i className="fas fa-download"></i>
                </button>
                <button style={{
                  padding: 'var(--space-8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s'
                }}>
                  <i className="fas fa-share"></i>
                </button>
              </div>
            </div>

            <div style={{ flex: 1, padding: 'var(--space-20)', overflow: 'auto' }}>
              {isGenerating ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid var(--color-bg-muted)',
                    borderTop: '4px solid var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: 'var(--space-20)',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                  }}></div>
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: '500', marginBottom: 'var(--space-8)' }}>
                    Génération du contenu avec {aiModels.find(m => m.id === selectedModel)?.name}...
                  </p>
                  <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.7 }}>
                    <i className="fas fa-database" style={{ marginRight: 'var(--space-4)', color: 'var(--color-success)' }}></i>
                    Analyse des données WikiPro en cours
                  </p>
                </div>
              ) : (
                <div style={{ height: '100%' }}>
                  <textarea
                    value={canvasContent}
                    onChange={(e) => setCanvasContent(e.target.value)}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontSize: 'var(--font-size-sm)',
                      lineHeight: '1.6',
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'transparent',
                      fontFamily: 'var(--font-mono), monospace'
                    }}
                    placeholder="Le contenu généré apparaîtra ici..."
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IAStrategie;