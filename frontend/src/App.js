import React, { useState, useEffect } from 'react';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { appData } from './data.js';
import { Line, Doughnut, Bar, Radar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale
);

const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <Header toggleTheme={toggleTheme} theme={theme} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <MainContent activeTab={activeTab} />
    </>
  );
}

const Header = ({ toggleTheme, theme }) => (
  <header className="header">
    <div className="container">
      <div className="header__content">
        <div className="header__brand">
          <div className="logo">
            <i className="fas fa-chart-line"></i>
            <span className="logo__text">Groupe Elan</span>
          </div>
          <p className="header__subtitle">WikiPro</p>
        </div>
        <div className="header__actions">
          <div className="search-bar">
            <input type="text" placeholder="Recherche globale..." className="search-bar__input" />
            <button className="search-bar__button">
              <i className="fas fa-search"></i>
            </button>
          </div>
          <button className="theme-toggle" id="themeToggle" onClick={toggleTheme}>
            <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
          </button>
        </div>
      </div>
    </div>
  </header>
);

const Navigation = ({ activeTab, setActiveTab }) => (
  <nav className="navigation">
    <div className="container">
      <div className="nav-tabs">
        <NavTab tabId="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-tachometer-alt" label="Vue d'ensemble" />
        <NavTab tabId="tendances" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-chart-line" label="Tendances" />
        <NavTab tabId="mots-cles" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-tags" label="Mots-clés" />
        <NavTab tabId="poles" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-sitemap" label="Pôles" />
        <NavTab tabId="capitalisation" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-book" label="Méthodes" />
        <NavTab tabId="references" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-folder-open" label="Références" />
        <NavTab tabId="data" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-database" label="Data" />
        <NavTab tabId="illustrations" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-images" label="Illustrations" />
        <NavTab tabId="outils" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-tools" label="Outils" />
        <NavTab tabId="cvtheque" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-users" label="CVthèque" />
        <NavTab tabId="competences" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-user-graduate" label="Compétences" />
        <NavTab tabId="ia-strategie" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-brain" label="IA" />
      </div>
    </div>
  </nav>
);

const NavTab = ({ tabId, activeTab, setActiveTab, icon, label }) => (
  <button className={`nav-tab ${activeTab === tabId ? 'active' : ''}`} onClick={() => setActiveTab(tabId)}>
    <i className={`fas ${icon}`}></i>
    <span>{label}</span>
  </button>
);

const MainContent = ({ activeTab }) => (
  <main className="main-content">
    <div className="container">
      <TabContent id="dashboard" activeTab={activeTab}>
        <Dashboard />
      </TabContent>
      <TabContent id="tendances" activeTab={activeTab}>
        <Tendances />
      </TabContent>
      <TabContent id="mots-cles" activeTab={activeTab}>
        <MotsCles />
      </TabContent>
      <TabContent id="poles" activeTab={activeTab}>
        <Poles />
      </TabContent>
      <TabContent id="capitalisation" activeTab={activeTab}>
        <Capitalisation />
      </TabContent>
      <TabContent id="references" activeTab={activeTab}>
        <ReferencesModule />
      </TabContent>
      <TabContent id="data" activeTab={activeTab}>
        <DataModule />
      </TabContent>
      <TabContent id="illustrations" activeTab={activeTab}>
        <IllustrationModule />
      </TabContent>
      <TabContent id="outils" activeTab={activeTab}>
        <OutilsModule />
      </TabContent>
      <TabContent id="cvtheque" activeTab={activeTab}>
        <CVthequeModule />
      </TabContent>
      <TabContent id="competences" activeTab={activeTab}>
        <CompetencesModule />
      </TabContent>
      <TabContent id="ia-strategie" activeTab={activeTab}>
        <IAStrategie />
      </TabContent>
    </div>
  </main>
);

const TabContent = ({ id, activeTab, children }) => (
  <div id={id} className={`tab-content ${activeTab === id ? 'active' : ''}`}>
    {children}
  </div>
);

const Dashboard = () => (
  <>
    <Kpis />
    <Document360Widget />
    <div className="charts-grid">
      <EvolutionChart />
      <PolesChart />
    </div>
    <SyntheseTable />
  </>
);

const Kpis = () => (
  <div className="kpis-grid">
    <KpiCard icon="fa-file-alt" value={appData.kpis.total_etudes} label="Études totales" />
    <KpiCard icon="fa-tags" value={appData.kpis.total_mots_cles} label="Mots-clés uniques" />
    <KpiCard icon="fa-sitemap" value={appData.kpis.nb_poles} label="Pôles d'expertise" />
    <KpiCard icon="fa-layer-group" value={appData.kpis.nb_typologies} label="Typologies d'études" />
  </div>
);

const KpiCard = ({ icon, value, label }) => (
  <div className="kpi-card">
    <div className="kpi-card__icon">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="kpi-card__content">
      <div className="kpi-card__value">{value}</div>
      <div className="kpi-card__label">{label}</div>
    </div>
  </div>
);

const Document360Widget = () => (
  <div className="card document360-widget">
    <div className="card__body">
      <h3>posez une question</h3>
      <div className="document360-search">
        <input type="text" placeholder="Rechercher dans la documentation..." className="form-control" />
        <button className="btn btn--primary">Rechercher</button>
      </div>
      <div className="document360-results">
        <div className="result-item">
          <h4>Processus de capitalisation des études</h4>
          <p>Documentation du processus de capitalisation des connaissances...</p>
          <span className="status status--success">Capitalisation</span>
        </div>
        <div className="result-item">
          <h4>Processus de gains de productivité</h4>
          <p>Optimisation des processus pour améliorer l'efficacité...</p>
          <span className="status status--info">Productivité</span>
        </div>
        <div className="result-item">
          <h4>Processus d'extraction des connaissance</h4>
          <p>Méthodes d'extraction et de structuration des savoirs...</p>
          <span className="status status--warning">Extraction</span>
        </div>
        <div className="result-item">
          <h4>Corrélation entre problématiques et réponses apportées</h4>
          <p>Analyse des liens entre les enjeux identifiés et les solutions...</p>
          <span className="status status--info">Analyse</span>
        </div>
      </div>
    </div>
  </div>
);

const EvolutionChart = () => (
  <div className="card chart-container">
    <div className="card__body">
      <h3>Évolution du nombre d'études par année</h3>
      <Line
        data={{
          labels: appData.evolution_annuelle.annees,
          datasets: [{
            label: 'Nombre d\'études',
            data: appData.evolution_annuelle.nombres,
            borderColor: chartColors[0],
            backgroundColor: chartColors[0] + '20',
            tension: 0.4,
            fill: true
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  </div>
);

const PolesChart = () => (
  <div className="card chart-container">
    <div className="card__body">
      <h3>Répartition par pôles</h3>
      <Doughnut
        data={{
          labels: appData.poles.labels.map(label => label.length > 30 ? label.substring(0, 30) + '...' : label),
          datasets: [{
            data: appData.poles.values,
            backgroundColor: chartColors.slice(0, appData.poles.values.length)
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 10,
                font: {
                  size: 11
                }
              }
            }
          }
        }}
      />
    </div>
  </div>
);

const SyntheseTable = () => (
  <div className="card">
    <div className="card__body">
      <h3>Tableau de synthèse par année</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Année</th>
            <th>Nombre d'études</th>
            <th>Pôles actifs</th>
          </tr>
        </thead>
        <tbody>
          {appData.synthese_annuelle.map(item => (
            <tr key={item.annee}>
              <td>{item.annee}</td>
              <td>{item.nb_etudes}</td>
              <td>{item.nb_poles_actifs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Tendances = () => (
    <div className="charts-grid">
        <TendancesChart />
        <TypologiesChart />
    </div>
);

const TendancesChart = () => (
    <div className="card chart-container">
        <div className="card__body">
            <h3>Évolution par pôles d'expertise</h3>
            <Line
                data={{
                    labels: appData.evolution_annuelle.annees,
                    datasets: appData.poles.labels.map((label, index) => ({
                        label: label.length > 20 ? label.substring(0, 20) + '...' : label,
                        data: appData.evolution_annuelle.annees.map(() => Math.floor(Math.random() * 20) + 5),
                        borderColor: chartColors[index],
                        backgroundColor: chartColors[index] + '20',
                        tension: 0.3
                    }))
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 10,
                                font: {
                                    size: 10
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }}
            />
        </div>
    </div>
);

const TypologiesChart = () => (
    <div className="card chart-container">
        <div className="card__body">
            <h3>Top 10 des typologies d'études</h3>
            <Bar
                data={{
                    labels: appData.top_typologies.labels.map(label => label.length > 25 ? label.substring(0, 25) + '...' : label),
                    datasets: [{
                        label: 'Nombre d\'études',
                        data: appData.top_typologies.values,
                        backgroundColor: chartColors[1],
                        borderColor: chartColors[1],
                        borderWidth: 1
                    }]
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    }
                }}
            />
        </div>
    </div>
);

const MotsCles = () => {
  const [categorieFilter, setCategorieFilter] = useState('');
  const [poleFilter, setPoleFilter] = useState('');
  const [typologieFilter, setTypologieFilter] = useState('');

  const handleFilterChange = (event) => {
    setCategorieFilter(event.target.value);
  };

  const handlePoleFilterChange = (event) => {
    setPoleFilter(event.target.value);
  };

  const handleTypologieFilterChange = (event) => {
    setTypologieFilter(event.target.value);
  };

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Catégorie</label>
            <select id="categorieFilter" className="form-control" onChange={handleFilterChange}>
              <option value="">Toutes les catégories</option>
              <option value="Contexte">Contexte</option>
              <option value="Enjeux">Enjeux</option>
              <option value="Réponses">Réponses</option>
              <option value="Étude">Étude</option>
              <option value="Méthodes">Méthodes</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Pôle</label>
            <select id="poleFilter" className="form-control" onChange={handlePoleFilterChange}>
              <option value="">Tous les pôles</option>
              {appData.poles.labels.map((pole, index) => (
                <option key={index} value={pole}>{pole}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Typologie</label>
            <select id="typologieFilter" className="form-control" onChange={handleTypologieFilterChange}>
              <option value="">Toutes les typologies</option>
              {appData.top_typologies.labels.map((typologie, index) => (
                <option key={index} value={typologie}>{typologie}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Année</label>
            <select id="anneeFilter" className="form-control">
              <option value="">Toutes les années</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
        </div>
      </div>
      <div className="charts-grid">
        <WordCloud selectedCategory={categorieFilter} selectedPole={poleFilter} selectedTypologie={typologieFilter} />
        <HeatmapChart />
      </div>
    </>
  );
};

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

const HeatmapChart = () => {
  const allWords = [];
  Object.keys(appData.mots_cles_par_categorie).forEach(category => {
    appData.mots_cles_par_categorie[category].labels.forEach((word, index) => {
      allWords.push({
        word: word,
        value: appData.mots_cles_par_categorie[category].values[index],
        category: category
      });
    });
  });

  allWords.sort((a, b) => b.value - a.value);
  const topWords = allWords.slice(0, 15);

  return (
    <div className="card chart-container">
      <div className="card__body">
        <h3>Heatmap de densité des mots-clés</h3>
        <Bar
          data={{
            labels: topWords.map(item => item.word),
            datasets: [{
              label: 'Fréquence',
              data: topWords.map(item => item.value),
              backgroundColor: topWords.map((item, index) => chartColors[index % chartColors.length]),
              borderWidth: 1
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                ticks: {
                  maxRotation: 45
                }
              },
              y: {
                beginAtZero: true
              }
            }
          }}
        />
      </div>
    </div>
  );
};

const Poles = () => (
  <>
    <div className="charts-grid">
      <PolesPieChart />
      <TopTypologiesChart />
    </div>
    <PolesDetails />
  </>
);

const PolesPieChart = () => (
  <div className="card chart-container">
    <div className="card__body">
      <h3>Répartition par pôles</h3>
      <Pie
        data={{
          labels: appData.poles.labels.map(label => label.length > 20 ? label.substring(0, 20) + '...' : label),
          datasets: [{
            data: appData.poles.values,
            backgroundColor: chartColors.slice(0, appData.poles.values.length)
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                padding: 8,
                font: {
                  size: 10
                }
              }
            }
          }
        }}
      />
    </div>
  </div>
);

const TopTypologiesChart = () => (
  <div className="card chart-container">
    <div className="card__body">
      <h3>Top 15 des typologies</h3>
      <Bar
        data={{
          labels: appData.top_typologies.labels.slice(0, 15).map(label => label.length > 20 ? label.substring(0, 20) + '...' : label),
          datasets: [{
            label: 'Nombre d\'études',
            data: appData.top_typologies.values.slice(0, 15),
            backgroundColor: chartColors[2],
            borderColor: chartColors[2],
            borderWidth: 1
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 45
              }
            },
            y: {
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  </div>
);

const PolesDetails = () => (
  <div className="card">
    <div className="card__body">
      <h3>Tableau détaillé par pôle et typologie</h3>
      <div className="poles-details" id="polesDetails">
        {appData.poles.labels.map((pole, index) => (
          <div key={pole} className="pole-detail">
            <h4>{pole}</h4>
            <div className="pole-studies">{appData.poles.values[index]} études</div>
            <ul className="pole-typologies">
              {appData.top_typologies.labels.slice(0, 3).map(typo => <li key={typo}>• {typo}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Capitalisation = () => (
  <>
    <MethodologiesGrid />
    <ProcessTimeline />
    <Document360Capitalisation />
  </>
);

const MethodologiesGrid = () => (
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
);

const ProcessTimeline = () => (
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
);

const Document360Capitalisation = () => (
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
);

// Interface de Rédaction IA WikiPro - Style Gemini épuré
const IAStrategie = () => {
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [inputText, setInputText] = useState('');
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasContent, setCanvasContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const aiModels = [
    { id: 'gemini', name: 'Gemini Pro', icon: '🟢', provider: 'Google' },
    { id: 'chatgpt', name: 'GPT-4', icon: '🟡', provider: 'OpenAI' },
    { id: 'claude', name: 'Claude 3.5', icon: '🔵', provider: 'Anthropic' },
    { id: 'mistral', name: 'Mistral Large', icon: '🟠', provider: 'Mistral AI' }
  ];

  const dataConnectors = {
    references: `Données disponibles : ${appData.references.length} références d'études`,
    competences: `${appData.competences.length} compétences répertoriées`,
    poles: `${appData.poles.labels.length} pôles d'expertise actifs`,
    budget: `Budget total : ${Math.round(appData.references.reduce((acc, r) => acc + parseInt(r.budget.replace(/[€\s]/g, '')), 0) / 1000)}K€`
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setShowCanvas(true);
    
    // Simulation de génération avec données contextuelles
    setTimeout(() => {
      const generatedContent = generateContextualContent(inputText);
      setCanvasContent(generatedContent);
      setIsGenerating(false);
    }, 2000 + Math.random() * 1000);
  };

  const generateContextualContent = (prompt) => {
    const basePrompt = prompt.toLowerCase();
    
    if (basePrompt.includes('rapport') || basePrompt.includes('synthèse')) {
      return `# Rapport de synthèse des activités WikiPro

## Vue d'ensemble
Analyse basée sur les données actuelles de l'entreprise :
- **${appData.references.length} études** réalisées sur la période
- **${appData.poles.labels.length} pôles** d'expertise mobilisés
- **Budget total** : ${Math.round(appData.references.reduce((acc, r) => acc + parseInt(r.budget.replace(/[€\s]/g, '')), 0) / 1000)}K€

## Répartition par pôles
${appData.poles.labels.map((pole, index) => 
  `- **${pole}** : ${appData.poles.values[index]} études`
).join('\n')}

## Tendances identifiées
Les projets de reconversion urbaine (friches industrielles, centres commerciaux) représentent une part croissante de l'activité, avec une montée en puissance des enjeux de transition énergétique.

## Recommandations
1. Renforcer l'expertise en économie circulaire
2. Développer les partenariats public-privé
3. Intégrer davantage les outils numériques dans nos méthodes

*Document généré avec l'IA ${selectedModel} - ${new Date().toLocaleDateString()}*`;
    }
    
    if (basePrompt.includes('proposition') || basePrompt.includes('offre')) {
      return `# Proposition commerciale

## Contexte du projet
Basé sur notre expertise démontrée dans ${appData.references.length} références similaires.

## Notre approche
Mobilisation de nos **${appData.poles.labels.length} pôles d'expertise** :

${appData.poles.labels.slice(0, 3).map(pole => 
  `### ${pole}
  Équipe dédiée avec méthodologies éprouvées`
).join('\n\n')}

## Livrables proposés
- Diagnostic territorial approfondi
- Stratégie d'aménagement personnalisée  
- Plan d'actions opérationnel
- Accompagnement à la mise en œuvre

## Références pertinentes
${appData.references.slice(0, 2).map(ref => 
  `**${ref.titre}** - ${ref.client} (${ref.annee})
  Budget: ${ref.budget} | Durée: ${ref.duree} | Statut: ${ref.statut}`
).join('\n\n')}

*Proposition générée avec ${selectedModel} - Contact: equipe@wikipro.fr*`;
    }
    
    return `# Document généré

Analyse contextuelle basée sur vos données WikiPro :

## Données mobilisées
- **Références** : ${appData.references.length} études dans la base
- **Expertises** : ${appData.competences.length} compétences disponibles  
- **Pôles actifs** : ${appData.poles.labels.length} domaines d'intervention
- **Objets d'études** : ${appData.objets_etudes.length} types de projets couverts

## Contenu personnalisé
Le contenu sera adapté selon votre demande spécifique, en mobilisant :
- Les données de vos références clients
- L'expertise de vos équipes par pôle
- Les méthodologies éprouvées
- Les retours d'expérience capitalisés

*Généré par ${aiModels.find(m => m.id === selectedModel)?.name} le ${new Date().toLocaleDateString()}*`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div style={{height: '100vh', display: 'flex', backgroundColor: 'var(--color-bg-subtle)'}}>
      {/* Zone de saisie principale */}
      <div style={{flex: showCanvas ? '1' : '1', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)', borderRight: showCanvas ? '1px solid var(--color-border)' : 'none'}}>
        
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
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-16)'}}>
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
                  <i className="fas fa-brain" style={{color: 'white', fontSize: '20px'}}></i>
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
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-8)'}}>
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
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-red-600)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-error)'}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Zone de saisie centrale */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--space-32)', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{width: '100%', maxWidth: '700px', textAlign: 'center'}}>
            <h3 style={{marginBottom: 'var(--space-24)', fontSize: 'var(--font-size-xl)', fontWeight: '600', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}>
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
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
              />
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-16)', textAlign: 'left'}}>
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
                  <span style={{fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'white'}}>
                    Connecté aux données WikiPro • {aiModels.find(m => m.id === selectedModel)?.name}
                  </span>
                </div>
                
                <div style={{display: 'flex', gap: 'var(--space-8)'}}>
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
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-orange-600)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-warning)'}
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
                    onMouseEnter={(e) => {
                      if (inputText.trim() && !isGenerating) {
                        e.target.style.backgroundColor = 'var(--color-teal-600)';
                        e.target.style.boxShadow = '0 6px 16px rgba(20, 184, 166, 0.4)';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (inputText.trim() && !isGenerating) {
                        e.target.style.backgroundColor = 'var(--color-primary)';
                        e.target.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.3)';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <div style={{width: '16px', height: '16px', border: '2px solid currentColor', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
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
        <div style={{flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)', borderLeft: '3px solid var(--color-primary)'}}>
          <div style={{
            padding: 'var(--space-16)', 
            borderBottom: '1px solid var(--color-border)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-teal-400) 100%)',
            color: 'white'
          }}>
            <h3 style={{margin: '0', fontSize: 'var(--font-size-lg)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: 'var(--space-8)'}}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="fas fa-edit" style={{fontSize: '14px'}}></i>
              </div>
              Canvas de rédaction
            </h3>
            <div style={{display: 'flex', gap: 'var(--space-8)'}}>
              <button style={{
                padding: 'var(--space-8)', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.2)', 
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer', 
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
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
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
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
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <i className="fas fa-share"></i>
              </button>
            </div>
          </div>
          
          <div style={{flex: 1, padding: 'var(--space-20)', overflow: 'auto'}}>
            {isGenerating ? (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)'}}>
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
                <p style={{fontSize: 'var(--font-size-base)', fontWeight: '500', marginBottom: 'var(--space-8)'}}>
                  Génération du contenu avec {aiModels.find(m => m.id === selectedModel)?.name}...
                </p>
                <p style={{fontSize: 'var(--font-size-sm)', opacity: 0.7}}>
                  <i className="fas fa-database" style={{marginRight: 'var(--space-4)', color: 'var(--color-success)'}}></i>
                  Analyse des données WikiPro en cours
                </p>
              </div>
            ) : (
              <div style={{height: '100%'}}>
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

// Module Data - Sources et traitement de données
const DataModule = () => {
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSources = appData.dataSources.filter(source => 
    (!selectedType || source.type === selectedType) &&
    (!searchTerm || source.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     source.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Type de données</label>
            <select className="form-control" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="">Tous les types</option>
              <option value="Démographie">Démographie</option>
              <option value="Territorial">Territorial</option>
              <option value="Économique">Économique</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Rechercher</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Rechercher une source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <h3>Sources de données disponibles</h3>
            <div className="methodologies-grid">
              {filteredSources.map(source => (
                <div key={source.id} className="methodology-card">
                  <div className="methodology-header">
                    <h4>{source.name}</h4>
                    <span className={`status ${source.status === 'active' ? 'status--success' : 'status--warning'}`}>
                      {source.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="methodology-meta">
                    <span className={`methodology-impact methodology-impact--${source.type.toLowerCase()}`}>
                      {source.type}
                    </span>
                  </div>
                  <p>{source.description}</p>
                  <div className="methodology-details">
                    <div className="detail-item">
                      <i className="fas fa-key"></i>
                      <span><strong>Accès:</strong> {source.access}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-calendar"></i>
                      <span><strong>MAJ:</strong> {source.lastUpdate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <h3>Traitements de données</h3>
            <div className="methodologies-grid">
              {appData.dataProcessing.map(processing => (
                <div key={processing.id} className="methodology-card">
                  <h4>{processing.name}</h4>
                  <p>{processing.description}</p>
                  <div className="methodology-tools">
                    <span className="tools-label">Outils:</span>
                    <div className="tools-list">
                      {processing.tools.map(tool => (
                        <span key={tool} className="tool-badge">{tool}</span>
                      ))}
                    </div>
                  </div>
                  <span className={`methodology-impact methodology-impact--${processing.complexity.toLowerCase()}`}>
                    {processing.complexity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Module Illustrations - Sélection d'illustrations
const IllustrationModule = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTags, setSearchTags] = useState('');

  const filteredIllustrations = appData.illustrations.filter(illustration => 
    (!selectedCategory || illustration.category === selectedCategory) &&
    (!selectedType || illustration.type === selectedType) &&
    (!searchTags || illustration.tags.some(tag => 
      tag.toLowerCase().includes(searchTags.toLowerCase())
    ))
  );

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Catégorie</label>
            <select className="form-control" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Toutes les catégories</option>
              <option value="Urbanisme">Urbanisme</option>
              <option value="Démographie">Démographie</option>
              <option value="Économie">Économie</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Type</label>
            <select className="form-control" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="">Tous les types</option>
              <option value="Schéma">Schéma</option>
              <option value="Graphique">Graphique</option>
              <option value="Cartographie">Cartographie</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Recherche par tags</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ex: aménagement, urbain..."
              value={searchTags}
              onChange={(e) => setSearchTags(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <h3>Illustrations disponibles ({filteredIllustrations.length})</h3>
            <div className="methodologies-grid">
              {filteredIllustrations.map(illustration => (
                <div key={illustration.id} className="methodology-card">
                  <div className="illustration-preview">
                    <i className="fas fa-image" style={{fontSize: '48px', color: 'var(--color-text-muted)'}}></i>
                  </div>
                  <div className="methodology-content">
                    <h4>{illustration.title}</h4>
                    <p>{illustration.description}</p>
                    <div className="methodology-meta">
                      <span className={`methodology-impact methodology-impact--${illustration.category.toLowerCase()}`}>
                        {illustration.category}
                      </span>
                      <span className="status status--info">
                        {illustration.type}
                      </span>
                    </div>
                    <div className="tags-container">
                      {illustration.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div className="methodology-usage">
                      <i className="fas fa-info-circle"></i>
                      <span>{illustration.usage}</span>
                    </div>
                    <div className="methodology-actions">
                      <button className="btn btn--primary btn--sm">Sélectionner</button>
                      <button className="btn btn--outline btn--sm">Aperçu</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Module Outils - Présentation comme Méthodes
const OutilsModule = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredOutils = appData.outils.filter(outil => 
    !selectedCategory || outil.category === selectedCategory
  );

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Catégorie</label>
            <select className="form-control" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Toutes les catégories</option>
              <option value="Diagnostic">Diagnostic</option>
              <option value="Gouvernance">Gouvernance</option>
              <option value="Analyse">Analyse</option>
            </select>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <h3>Outils disponibles</h3>
            <div className="methodologies-grid">
              {filteredOutils.map(outil => (
                <div key={outil.id} className="methodology-card">
                  <div className="methodology-header">
                    <h4>{outil.name}</h4>
                    <span className={`methodology-impact methodology-impact--${outil.impact.toLowerCase()}`}>
                      {outil.impact}
                    </span>
                  </div>
                  <p className="methodology-description">{outil.description}</p>
                  
                  <div className="methodology-section">
                    <h5><i className="fas fa-list-ul"></i> Instructions d'utilisation</h5>
                    <div className="instructions-list">
                      {outil.instructions.split('\n').map((instruction, index) => (
                        <div key={index} className="instruction-item">
                          <i className="fas fa-chevron-right"></i>
                          <span>{instruction}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="methodology-section">
                    <h5><i className="fas fa-cog"></i> Mobilisation</h5>
                    <p className="mobilisation-text">{outil.mobilisation}</p>
                  </div>

                  <div className="methodology-meta">
                    <span className={`status status--${outil.category.toLowerCase() === 'diagnostic' ? 'info' : outil.category.toLowerCase() === 'gouvernance' ? 'success' : 'warning'}`}>
                      {outil.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Module CVthèque - Recherche et sélection de CV
const CVthequeModule = () => {
  const [searchName, setSearchName] = useState('');
  const [selectedPole, setSelectedPole] = useState('');
  const [selectedDisponibilite, setSelectedDisponibilite] = useState('');
  const [selectedCompetence, setSelectedCompetence] = useState('');

  const filteredCVs = appData.cvtheque.filter(cv => 
    (!searchName || cv.nom.toLowerCase().includes(searchName.toLowerCase())) &&
    (!selectedPole || cv.pole === selectedPole) &&
    (!selectedDisponibilite || cv.disponibilite === selectedDisponibilite) &&
    (!selectedCompetence || cv.competences.some(comp => 
      comp.toLowerCase().includes(selectedCompetence.toLowerCase())
    ))
  );

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Nom</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Rechercher par nom..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="form-label">Pôle</label>
            <select className="form-control" value={selectedPole} onChange={(e) => setSelectedPole(e.target.value)}>
              <option value="">Tous les pôles</option>
              {appData.poles.labels.map((pole, index) => (
                <option key={index} value={pole}>{pole}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Disponibilité</label>
            <select className="form-control" value={selectedDisponibilite} onChange={(e) => setSelectedDisponibilite(e.target.value)}>
              <option value="">Toutes</option>
              <option value="Disponible">Disponible</option>
              <option value="Partiellement disponible">Partiellement disponible</option>
              <option value="Non disponible">Non disponible</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Compétence</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ex: SIG, urbanisme..."
              value={selectedCompetence}
              onChange={(e) => setSelectedCompetence(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <h3>Profils disponibles ({filteredCVs.length})</h3>
            <div className="methodologies-grid">
              {filteredCVs.map(cv => (
                <div key={cv.id} className="methodology-card">
                  <div className="cv-header">
                    <div className="cv-photo">
                      <i className="fas fa-user-circle" style={{fontSize: '40px', color: 'var(--color-primary)'}}></i>
                    </div>
                    <div className="cv-basic-info">
                      <h4>{cv.nom}</h4>
                      <p className="cv-poste">{cv.poste}</p>
                      <p className="cv-experience">{cv.experience} d'expérience</p>
                    </div>
                    <div className="cv-availability">
                      <span className={`status ${cv.disponibilite === 'Disponible' ? 'status--success' : cv.disponibilite === 'Partiellement disponible' ? 'status--warning' : 'status--error'}`}>
                        {cv.disponibilite}
                      </span>
                    </div>
                  </div>
                  
                  <div className="cv-details">
                    <div className="methodology-section">
                      <div className="detail-row">
                        <i className="fas fa-building"></i>
                        <span><strong>Pôle:</strong> {cv.pole}</span>
                      </div>
                      <div className="detail-row">
                        <i className="fas fa-map-marker-alt"></i>
                        <span><strong>Localisation:</strong> {cv.localisation}</span>
                      </div>
                    </div>

                    <div className="methodology-section">
                      <h5><i className="fas fa-skills"></i> Compétences clés</h5>
                      <div className="tags-container">
                        {cv.competences.map(competence => (
                          <span key={competence} className="tag">{competence}</span>
                        ))}
                      </div>
                    </div>

                    <div className="methodology-section">
                      <h5><i className="fas fa-project-diagram"></i> Projets récents</h5>
                      <ul className="projets-list">
                        {cv.projets_recents.map((projet, index) => (
                          <li key={index}>
                            <i className="fas fa-dot-circle"></i>
                            <span>{projet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="methodology-actions">
                      <button className="btn btn--primary btn--sm">Sélectionner</button>
                      <button className="btn btn--outline btn--sm">Voir détails</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Module Compétences - Matrice et liste
const CompetencesModule = () => {
  const [selectedPole, setSelectedPole] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');

  const filteredMatrice = appData.matriceCompetences.data.filter(item => 
    (!selectedPole || item.pole === selectedPole) &&
    (!selectedNiveau || item.niveau_requis === selectedNiveau)
  );

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Pôle</label>
            <select className="form-control" value={selectedPole} onChange={(e) => setSelectedPole(e.target.value)}>
              <option value="">Tous les pôles</option>
              {appData.matriceCompetences.poles.map((pole, index) => (
                <option key={index} value={pole}>{pole}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Niveau requis</label>
            <select className="form-control" value={selectedNiveau} onChange={(e) => setSelectedNiveau(e.target.value)}>
              <option value="">Tous les niveaux</option>
              {appData.matriceCompetences.niveaux.map((niveau, index) => (
                <option key={index} value={niveau}>{niveau}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <h3>Liste des compétences disponibles</h3>
            <div className="word-cloud">
              {appData.competences.map((competence, index) => (
                <span 
                  key={index} 
                  className="word-item word-size-2"
                  title={`Compétence: ${competence}`}
                >
                  {competence}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <h3>Matrice de compétences</h3>
            <div className="matrice-legend" style={{marginBottom: 'var(--space-16)'}}>
              <div className="filters" style={{justifyContent: 'center', gap: 'var(--space-24)'}}>
                {appData.matriceCompetences.niveaux.map(niveau => (
                  <div key={niveau} className="legend-item">
                    <span className={`status ${niveau === 'Débutant' ? 'status--info' : niveau === 'Intermédiaire' ? 'status--warning' : niveau === 'Confirmé' ? 'status--success' : 'status--error'}`}>
                      {niveau}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="methodologies-grid">
              {filteredMatrice.map((item, index) => (
                <div key={index} className="methodology-card">
                  <div className="methodology-header">
                    <h4>{item.competence}</h4>
                    <span className={`methodology-impact methodology-impact--${item.niveau_requis.toLowerCase()}`}>
                      {item.niveau_requis}
                    </span>
                  </div>
                  <p className="methodology-pole">{item.pole}</p>
                  <div className="methodology-meta">
                    <div className="kpi-item">
                      <span className="kpi-value">{item.disponible}</span>
                      <span className="kpi-label">personnes disponibles</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <h3>Générateur de matrice</h3>
            <div className="document360-articles">
              <div className="article-item">
                <h4>Matrice personnalisée</h4>
                <p>Génération automatique de matrices selon les besoins du projet</p>
                <span className="status status--info">Générateur</span>
              </div>
            </div>
            <div className="methodology-actions" style={{marginTop: 'var(--space-16)'}}>
              <button className="btn btn--primary">
                <i className="fas fa-magic"></i>
                Générer une matrice
              </button>
              <button className="btn btn--outline">
                <i className="fas fa-download"></i>
                Exporter en Excel
              </button>
              <button className="btn btn--outline">
                <i className="fas fa-upload"></i>
                Importer des données
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Module Références - Liste des études réalisées
const ReferencesModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPole, setSelectedPole] = useState('');
  const [selectedTypologie, setSelectedTypologie] = useState('');
  const [selectedObjet, setSelectedObjet] = useState('');
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [sortBy, setSortBy] = useState('annee');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filtrage des références
  const filteredReferences = appData.references.filter(ref => 
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

  // Tri des références
  const sortedReferences = [...filteredReferences].sort((a, b) => {
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

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Recherche</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Titre, client, description ou mots-clés..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="form-label">Pôle</label>
            <select className="form-control" value={selectedPole} onChange={(e) => setSelectedPole(e.target.value)}>
              <option value="">Tous les pôles</option>
              {appData.poles.labels.map((pole, index) => (
                <option key={index} value={pole}>{pole}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Typologie</label>
            <select className="form-control" value={selectedTypologie} onChange={(e) => setSelectedTypologie(e.target.value)}>
              <option value="">Toutes les typologies</option>
              {appData.top_typologies.labels.map((typologie, index) => (
                <option key={index} value={typologie}>{typologie}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Objet</label>
            <select className="form-control" value={selectedObjet} onChange={(e) => setSelectedObjet(e.target.value)}>
              <option value="">Tous les objets</option>
              {appData.objets_etudes.map((objet, index) => (
                <option key={index} value={objet}>{objet}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Année</label>
            <select className="form-control" value={selectedAnnee} onChange={(e) => setSelectedAnnee(e.target.value)}>
              <option value="">Toutes les années</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Statut</label>
            <select className="form-control" value={selectedStatut} onChange={(e) => setSelectedStatut(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="Terminé">Terminé</option>
              <option value="En cours">En cours</option>
              <option value="En attente">En attente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <div className="references-header">
              <h3>Références ({sortedReferences.length} études)</h3>
              <div className="sort-controls">
                <label className="form-label">Trier par:</label>
                <div className="sort-buttons">
                  <button 
                    className={`btn btn--outline btn--sm ${sortBy === 'annee' ? 'active' : ''}`}
                    onClick={() => toggleSort('annee')}
                  >
                    Année {sortBy === 'annee' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                  <button 
                    className={`btn btn--outline btn--sm ${sortBy === 'titre' ? 'active' : ''}`}
                    onClick={() => toggleSort('titre')}
                  >
                    Titre {sortBy === 'titre' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                  <button 
                    className={`btn btn--outline btn--sm ${sortBy === 'budget' ? 'active' : ''}`}
                    onClick={() => toggleSort('budget')}
                  >
                    Budget {sortBy === 'budget' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                </div>
              </div>
            </div>

            <div className="methodologies-grid">
              {sortedReferences.map(reference => (
                <div key={reference.id} className="methodology-card" style={{padding: 'var(--space-20)'}}>
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
              ))}
            </div>

            {sortedReferences.length === 0 && (
              <div className="no-results">
                <i className="fas fa-search" style={{fontSize: '48px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-16)'}}></i>
                <h4>Aucune référence trouvée</h4>
                <p>Essayez de modifier vos critères de recherche ou filtres.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;