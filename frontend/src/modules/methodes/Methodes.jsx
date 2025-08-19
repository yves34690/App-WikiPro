import React from 'react';
import { appData } from '../../data.js';

const Methodes = () => (
  <>
    <div className="card">
      <div className="card__body">
        <h3>Méthodes clés</h3>
        <div className="methodologies-grid" id="methodologiesGrid">
          {appData.methodologies.map(methodology => (
            <div key={methodology.id} className="methodology-card">
              <h4>{methodology.title}</h4>
              <p>{methodology.description}</p>
              <span className={`methodology-impact methodology-impact--${methodology.impact.toLowerCase()}`}>{methodology.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="card">
      <div className="card__body">
        <h3>Timeline du processus</h3>
        <div className="timeline" id="processTimeline">
          {appData.processPhases.map(phase => (
            <div key={phase.step} className="timeline-item">
              <div className="timeline-step">{phase.step}</div>
              <div className="timeline-content">
                <h4>{phase.title}</h4>
                <p>{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="card document360-widget">
      <div className="card__body">
        <h3>Document360 - Documentation associée</h3>
        <div className="document360-articles">
          <div className="article-item">
            <h4>Méthodologie d'analyse territoriale</h4>
            <p>Guide complet pour l'analyse systémique des territoires</p>
            <span className="status status--info">Méthodologies</span>
          </div>
          <div className="article-item">
            <h4>Processus de capitalisation des études</h4>
            <p>Documentation du processus de capitalisation des connaissances</p>
            <span className="status status--success">Capitalisation</span>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default Methodes;