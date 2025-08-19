import React from 'react';

/**
 * Composant ReferenceCard - Carte d'affichage d'une référence
 */
const ReferenceCard = ({ reference }) => (
  <div className="methodology-card" style={{padding: 'var(--space-20)'}}>
    <div className="methodology-header" style={{marginBottom: 'var(--space-16)'}}>
      <h4 style={{marginBottom: 'var(--space-8)'}}>{reference.titre}</h4>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-12)'}}>
        <p style={{margin: '0', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)'}}>
          <i className="fas fa-building"></i>
          {reference.client}
        </p>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-8)'}}>
          <span style={{fontWeight: '600', color: 'var(--color-text-primary)'}}>{reference.annee}</span>
          <span className={`status ${reference.statut === 'Terminé' ? 'status--success' : reference.statut === 'En cours' ? 'status--warning' : 'status--info'}`}>
            {reference.statut}
          </span>
        </div>
      </div>
    </div>

    <div style={{marginBottom: 'var(--space-16)'}}>
      <p style={{lineHeight: '1.5', margin: '0'}}>{reference.description}</p>
    </div>
      
    <div style={{marginBottom: 'var(--space-16)'}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-12)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-8)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)'}}>
          <i className="fas fa-layer-group" style={{color: 'var(--color-primary)', minWidth: '16px'}}></i>
          <span style={{fontSize: 'var(--font-size-sm)'}}><strong>Pôle:</strong> {reference.pole}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-8)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)'}}>
          <i className="fas fa-cube" style={{color: 'var(--color-primary)', minWidth: '16px'}}></i>
          <span style={{fontSize: 'var(--font-size-sm)'}}><strong>Objet:</strong> {reference.objet}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-8)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)'}}>
          <i className="fas fa-clock" style={{color: 'var(--color-primary)', minWidth: '16px'}}></i>
          <span style={{fontSize: 'var(--font-size-sm)'}}><strong>Durée:</strong> {reference.duree}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-8)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)'}}>
          <i className="fas fa-euro-sign" style={{color: 'var(--color-primary)', minWidth: '16px'}}></i>
          <span style={{fontSize: 'var(--font-size-sm)'}}><strong>Budget:</strong> {reference.budget}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-8)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)'}}>
          <i className="fas fa-users" style={{color: 'var(--color-primary)', minWidth: '16px'}}></i>
          <span style={{fontSize: 'var(--font-size-sm)'}}><strong>Équipe:</strong> {reference.equipe} personnes</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-8)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)'}}>
          <i className="fas fa-tag" style={{color: 'var(--color-primary)', minWidth: '16px'}}></i>
          <span style={{fontSize: 'var(--font-size-sm)'}}><strong>Typologie:</strong> {reference.typologie}</span>
        </div>
      </div>
    </div>

    <div style={{marginBottom: 'var(--space-16)'}}>
      <h5 style={{display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-8)', fontSize: 'var(--font-size-sm)', fontWeight: '600'}}>
        <i className="fas fa-tags"></i> 
        Mots-clés ({reference.mots_cles.length})
      </h5>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)', overflow: 'hidden'}}>
        {reference.mots_cles.map(motCle => (
          <span key={motCle} className="tag" style={{flexShrink: 0, maxWidth: '100%', wordBreak: 'break-word'}}>{motCle}</span>
        ))}
      </div>
    </div>

    <div style={{marginBottom: 'var(--space-20)'}}>
      <h5 style={{display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-8)', fontSize: 'var(--font-size-sm)', fontWeight: '600'}}>
        <i className="fas fa-chart-line"></i> 
        Résultats
      </h5>
      <p style={{margin: '0', padding: 'var(--space-12)', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', lineHeight: '1.4', fontSize: 'var(--font-size-sm)'}}>{reference.resultats}</p>
    </div>

    <div className="methodology-actions">
      <button className="btn btn--primary btn--sm">
        <i className="fas fa-eye"></i>
        Voir détails
      </button>
      <button className="btn btn--outline btn--sm">
        <i className="fas fa-download"></i>
        Télécharger
      </button>
      <button className="btn btn--outline btn--sm">
        <i className="fas fa-share"></i>
        Partager
      </button>
    </div>
  </div>
);

export default ReferenceCard;