// Application Data
const appData = {
  "kpis": {
    "total_etudes": 233,
    "total_mots_cles": 4356,
    "nb_poles": 6,
    "nb_typologies": 20
  },
  "evolution_annuelle": {
    "annees": [2020, 2021, 2022, 2023, 2024],
    "nombres": [29, 66, 59, 58, 21]
  },
  "poles": {
    "labels": [
      "Aménagement, urbanisme, mobilité et environnement",
      "Développement économique & tourisme",
      "Ingénierie & conduite de projets",
      "Développement territorial & social",
      "Marketing territorial, concertation & communication",
      "Modélisation économique & financière"
    ],
    "values": [60, 55, 45, 38, 18, 17]
  },
  "top_typologies": {
    "labels": [
      "Études de faisabilité et de programmation",
      "Stratégie de développement économique",
      "Stratégie et prospective territoriale",
      "Conception de projets urbains",
      "Ingénierie financière et montage",
      "Modélisation économique & financière",
      "Planification et études de mobilité",
      "Planification territoriale",
      "Valorisation touristique",
      "Études de marché"
    ],
    "values": [53, 42, 39, 32, 28, 18, 18, 16, 15, 13]
  },
  "mots_cles_par_categorie": {
    "Contexte": {
      "labels": ["La Réunion", "PLU", "croissance démographique", "développement territorial", "Tourisme", "SCOT", "Mayotte", "Territoire rural"],
      "values": [12, 7, 7, 6, 6, 6, 5, 5]
    },
    "Enjeux": {
      "labels": ["attractivité", "attractivité territoriale", "financement", "accessibilité", "développement économique", "Développement durable"],
      "values": [18, 8, 7, 6, 6, 6]
    },
    "Réponses": {
      "labels": ["Feuille de route", "Mobilités douces", "ingénierie financière", "accompagnement entreprises", "gouvernance partagée"],
      "values": [7, 6, 5, 4, 4]
    },
    "Étude": {
      "labels": ["programmation", "faisabilité", "aménagement", "développement économique", "développement territorial"],
      "values": [24, 15, 14, 10, 9]
    },
    "Méthodes": {
      "labels": ["Entretiens", "Benchmark", "Plateforme collaborative", "Analyse documentaire", "Ateliers"],
      "values": [26, 20, 10, 9, 8]
    }
  },
  "methodologies": [
    {
      "id": 1,
      "title": "Approche systémique territoriale",
      "description": "Analyse des interdépendances entre acteurs, ressources et enjeux territoriaux",
      "impact": "Structurant"
    },
    {
      "id": 2,
      "title": "Prospective participative",
      "description": "Construction collective de scénarios d'avenir intégrant les visions des différents acteurs",
      "impact": "Innovant"
    },
    {
      "id": 3,
      "title": "Analyse multicritère spatiale",
      "description": "Évaluation géographique des potentialités et contraintes territoriales",
      "impact": "Opérationnel"
    },
    {
      "id": 4,
      "title": "Benchmarking territorial",
      "description": "Comparaison des pratiques et performances avec des territoires similaires",
      "impact": "Stratégique"
    }
  ],
  "processPhases": [
    {
      "step": 1,
      "title": "Diagnostic territorial approfondi",
      "desc": "Analyse des ressources, contraintes, dynamiques et acteurs du territoire selon une approche systémique multi-échelle."
    },
    {
      "step": 2,
      "title": "Co-construction des enjeux",
      "desc": "Identification participative des défis prioritaires avec les parties prenantes locales et définition d'une vision partagée."
    },
    {
      "step": 3,
      "title": "Élaboration stratégique",
      "desc": "Conception de scénarios d'intervention et définition d'une stratégie d'action territorialisée et opérationnelle."
    },
    {
      "step": 4,
      "title": "Programmation et mise en œuvre",
      "desc": "Déclinaison opérationnelle en actions concrètes avec calendrier, budget et indicateurs de suivi-évaluation."
    },
    {
      "step": 5,
      "title": "Accompagnement et évaluation",
      "desc": "Suivi des réalisations, évaluation des impacts et ajustement des stratégies selon une logique d'amélioration continue."
    }
  ],
  "iaBenchmark": [
    {"model": "GPT-4", "security": 7, "cost": 6, "capacity": 9, "score": 7.3},
    {"model": "Claude 3.5", "security": 8, "cost": 7, "capacity": 8, "score": 7.7},
    {"model": "Mistral Large", "security": 9, "cost": 8, "capacity": 7, "score": 8.0}
  ],
  "synthese_annuelle": [
    {"annee": 2020, "nb_etudes": 29, "nb_poles_actifs": 6},
    {"annee": 2021, "nb_etudes": 66, "nb_poles_actifs": 6},
    {"annee": 2022, "nb_etudes": 59, "nb_poles_actifs": 6},
    {"annee": 2023, "nb_etudes": 58, "nb_poles_actifs": 6},
    {"annee": 2024, "nb_etudes": 21, "nb_poles_actifs": 6}
  ]
};

// Charts storage
let charts = {};

// Chart colors
const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeThemeToggle();
    initializeCharts();
    initializeDynamicContent();
    initializeFilters();
});

// Navigation handling
function initializeNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Theme toggle - Fixed implementation
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Initialize theme to light mode
    html.setAttribute('data-color-scheme', 'light');
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-color-scheme', newTheme);
        
        // Update icon
        const icon = this.querySelector('i');
        if (newTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        
        // Update charts after a small delay to ensure theme transition
        setTimeout(() => {
            updateChartsForTheme();
        }, 150);
    });
}

// Initialize all charts
function initializeCharts() {
    createEvolutionChart();
    createPolesChart();
    createTendancesChart();
    createTypologiesChart();
    createHeatmapChart();
    createPolesPieChart();
    createTopTypologiesChart();
    createRadarChart();
}

// Evolution chart
function createEvolutionChart() {
    const ctx = document.getElementById('evolutionChart');
    if (!ctx) return;

    charts.evolution = new Chart(ctx, {
        type: 'line',
        data: {
            labels: appData.evolution_annuelle.annees,
            datasets: [{
                label: 'Nombre d\'études',
                data: appData.evolution_annuelle.nombres,
                borderColor: chartColors[0],
                backgroundColor: chartColors[0] + '20',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
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
        }
    });
}

// Poles doughnut chart
function createPolesChart() {
    const ctx = document.getElementById('polesChart');
    if (!ctx) return;

    charts.poles = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: appData.poles.labels.map(label => label.length > 30 ? label.substring(0, 30) + '...' : label),
            datasets: [{
                data: appData.poles.values,
                backgroundColor: chartColors.slice(0, appData.poles.values.length)
            }]
        },
        options: {
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
        }
    });
}

// Tendances chart
function createTendancesChart() {
    const ctx = document.getElementById('tendancesChart');
    if (!ctx) return;

    // Simulate evolution data for each pole
    const datasets = appData.poles.labels.map((label, index) => ({
        label: label.length > 20 ? label.substring(0, 20) + '...' : label,
        data: appData.evolution_annuelle.annees.map(() => Math.floor(Math.random() * 20) + 5),
        borderColor: chartColors[index],
        backgroundColor: chartColors[index] + '20',
        tension: 0.3
    }));

    charts.tendances = new Chart(ctx, {
        type: 'line',
        data: {
            labels: appData.evolution_annuelle.annees,
            datasets: datasets
        },
        options: {
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
        }
    });
}

// Typologies horizontal bar chart
function createTypologiesChart() {
    const ctx = document.getElementById('typologiesChart');
    if (!ctx) return;

    charts.typologies = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: appData.top_typologies.labels.map(label => label.length > 25 ? label.substring(0, 25) + '...' : label),
            datasets: [{
                label: 'Nombre d\'études',
                data: appData.top_typologies.values,
                backgroundColor: chartColors[1],
                borderColor: chartColors[1],
                borderWidth: 1
            }]
        },
        options: {
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
        }
    });
}

// Heatmap chart (simulated with bar chart)
function createHeatmapChart() {
    const ctx = document.getElementById('heatmapChart');
    if (!ctx) return;

    // Combine all categories data
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

    // Sort and take top 15
    allWords.sort((a, b) => b.value - a.value);
    const topWords = allWords.slice(0, 15);

    charts.heatmap = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topWords.map(item => item.word),
            datasets: [{
                label: 'Fréquence',
                data: topWords.map(item => item.value),
                backgroundColor: topWords.map((item, index) => chartColors[index % chartColors.length]),
                borderWidth: 1
            }]
        },
        options: {
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
        }
    });
}

// Poles pie chart
function createPolesPieChart() {
    const ctx = document.getElementById('polesPieChart');
    if (!ctx) return;

    charts.polesPie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: appData.poles.labels.map(label => label.length > 20 ? label.substring(0, 20) + '...' : label),
            datasets: [{
                data: appData.poles.values,
                backgroundColor: chartColors.slice(0, appData.poles.values.length)
            }]
        },
        options: {
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
        }
    });
}

// Top typologies chart
function createTopTypologiesChart() {
    const ctx = document.getElementById('topTypologiesChart');
    if (!ctx) return;

    charts.topTypologies = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: appData.top_typologies.labels.slice(0, 15).map(label => label.length > 20 ? label.substring(0, 20) + '...' : label),
            datasets: [{
                label: 'Nombre d\'études',
                data: appData.top_typologies.values.slice(0, 15),
                backgroundColor: chartColors[2],
                borderColor: chartColors[2],
                borderWidth: 1
            }]
        },
        options: {
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
        }
    });
}

// Radar chart for IA models
function createRadarChart() {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return;

    const datasets = appData.iaBenchmark.map((model, index) => ({
        label: model.model,
        data: [model.security, model.cost, model.capacity],
        borderColor: chartColors[index],
        backgroundColor: chartColors[index] + '20',
        pointBackgroundColor: chartColors[index],
        borderWidth: 2
    }));

    charts.radar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Sécurité', 'Coût', 'Capacité'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}

// Update charts for theme change
function updateChartsForTheme() {
    Object.values(charts).forEach(chart => {
        if (chart && chart.update) {
            chart.update('none');
        }
    });
}

// Initialize dynamic content
function initializeDynamicContent() {
    createSyntheseTable();
    createMethodologiesGrid();
    createProcessTimeline();
    createPolesDetails();
    createIABenchmarkTable();
    createWordCloud();
}

// Create synthese table
function createSyntheseTable() {
    const tbody = document.getElementById('syntheseTableBody');
    if (!tbody) return;

    appData.synthese_annuelle.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.annee}</td>
            <td>${item.nb_etudes}</td>
            <td>${item.nb_poles_actifs}</td>
        `;
        tbody.appendChild(row);
    });
}

// Create methodologies grid
function createMethodologiesGrid() {
    const container = document.getElementById('methodologiesGrid');
    if (!container) return;

    appData.methodologies.forEach(methodology => {
        const card = document.createElement('div');
        card.className = 'methodology-card';
        card.innerHTML = `
            <h4>${methodology.title}</h4>
            <p>${methodology.description}</p>
            <span class="methodology-impact methodology-impact--${methodology.impact.toLowerCase()}">${methodology.impact}</span>
        `;
        container.appendChild(card);
    });
}

// Create process timeline
function createProcessTimeline() {
    const container = document.getElementById('processTimeline');
    if (!container) return;

    appData.processPhases.forEach(phase => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-step">${phase.step}</div>
            <div class="timeline-content">
                <h4>${phase.title}</h4>
                <p>${phase.desc}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

// Create poles details
function createPolesDetails() {
    const container = document.getElementById('polesDetails');
    if (!container) return;

    appData.poles.labels.forEach((pole, index) => {
        const detail = document.createElement('div');
        detail.className = 'pole-detail';
        
        // Simulate typologies for each pole
        const typologies = appData.top_typologies.labels.slice(0, 3);
        
        detail.innerHTML = `
            <h4>${pole}</h4>
            <div class="pole-studies">${appData.poles.values[index]} études</div>
            <ul class="pole-typologies">
                ${typologies.map(typo => `<li>• ${typo}</li>`).join('')}
            </ul>
        `;
        container.appendChild(detail);
    });
}

// Create IA benchmark table
function createIABenchmarkTable() {
    const tbody = document.getElementById('iaBenchmarkTable');
    if (!tbody) return;

    appData.iaBenchmark.forEach(model => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${model.model}</td>
            <td>${model.security}/10</td>
            <td>${model.cost}/10</td>
            <td>${model.capacity}/10</td>
            <td><strong>${model.score}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// Create word cloud
function createWordCloud() {
    const container = document.getElementById('wordCloud');
    if (!container) return;

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

    // Sort by value and create word items
    allWords.sort((a, b) => b.value - a.value);
    
    allWords.forEach(item => {
        const wordElement = document.createElement('span');
        wordElement.className = `word-item word-size-${Math.min(5, Math.max(1, Math.floor(item.value / 5) + 1))}`;
        wordElement.textContent = item.word;
        wordElement.title = `${item.category}: ${item.value} occurrences`;
        container.appendChild(wordElement);
    });
}

// Initialize filters
function initializeFilters() {
    const categorieFilter = document.getElementById('categorieFilter');
    const anneeFilter = document.getElementById('anneeFilter');

    if (categorieFilter) {
        categorieFilter.addEventListener('change', function() {
            filterWordCloud();
        });
    }

    if (anneeFilter) {
        anneeFilter.addEventListener('change', function() {
            filterWordCloud();
        });
    }
}

// Filter word cloud
function filterWordCloud() {
    const categorieFilter = document.getElementById('categorieFilter');
    const container = document.getElementById('wordCloud');
    
    if (!categorieFilter || !container) return;

    const selectedCategory = categorieFilter.value;
    
    // Clear existing content
    container.innerHTML = '';

    if (!selectedCategory) {
        // Show all categories
        createWordCloud();
        return;
    }

    // Show only selected category
    const categoryData = appData.mots_cles_par_categorie[selectedCategory];
    if (categoryData) {
        categoryData.labels.forEach((word, index) => {
            const wordElement = document.createElement('span');
            wordElement.className = `word-item word-size-${Math.min(5, Math.max(1, Math.floor(categoryData.values[index] / 3) + 1))}`;
            wordElement.textContent = word;
            wordElement.title = `${selectedCategory}: ${categoryData.values[index]} occurrences`;
            container.appendChild(wordElement);
        });
    }
}