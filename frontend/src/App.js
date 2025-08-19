import React, { useState } from 'react';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Imports Chart.js
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

// Imports des composants partagés
import { Header, Navigation, TabContent } from './components/common';
import { useTheme } from './shared/hooks';

// Imports des modules
import { Dashboard } from './modules/dashboard';
import { References } from './modules/references';
import { MotsCles } from './modules/mots-cles';
import { IAStrategie } from './modules/ia-strategie';
import { Tendances } from './modules/tendances';
import { Poles } from './modules/poles';
import { Methodes } from './modules/methodes';
import { DataModule } from './modules/data';
import { IllustrationModule } from './modules/illustrations';
import { OutilsModule } from './modules/outils';
import { CVthequeModule } from './modules/cvtheque';
import { CompetencesModule } from './modules/competences';

// Configuration Chart.js
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

/**
 * Application WikiPro - Version modulaire
 * Architecture: 12 modules indépendants + composants partagés
 */
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Header toggleTheme={toggleTheme} theme={theme} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
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
            <Methodes />
          </TabContent>
          <TabContent id="references" activeTab={activeTab}>
            <References />
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
    </>
  );
}

export default App;