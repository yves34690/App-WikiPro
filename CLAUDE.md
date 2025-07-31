## Instructions pour Claude

- Toutes tes réponses, questions et commentaires doivent être exclusivement en français.
- Ne communique jamais en anglais, sauf si un extrait de code ou un message d'erreur l'exige.
- Agis comme un développeur francophone.

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Plan & Review

### Before starting work
- Write a plan to `.claude/tasks/TASK_NAME.md`.
- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.
- Don't over plan it, always think MVP.
- Once you write the plan, firstly ask me to review it. Do not continue until I approve the plan.

### While implementing
- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily hand over to other engineers.

## Project Overview

WikiPro is an AI-assisted knowledge management application designed for organizations (companies, local authorities, administrations, or associations). The fundamental principle is "One WikiPro = One Entity" - each instance is specifically adapted to serve one organization's unique knowledge base and processes.

The application serves as an intelligent knowledge base that transforms internal documents and accumulated expertise into an active, AI-powered resource capable of generating analyses, syntheses, and relevant responses.

## Architecture & Technology Stack

### Current Implementation (Frontend Only)
- **Main Application**: React-based SPA using Create React App
- **Language**: JavaScript (ES6+) 
- **UI Framework**: React with Chart.js for data visualization
- **Charts**: Chart.js with react-chartjs-2 integration
- **Icons**: FontAwesome free
- **Testing**: Jest and React Testing Library
- **Build Tools**: Standard Create React App toolchain

### Project Structure
```
App-WikiPro/
├── frontend/                 # Main React application
│   ├── src/
│   │   ├── App.js           # Main component with all modules
│   │   ├── data.js          # Static application data
│   │   ├── index.js         # Entry point
│   │   └── *.css            # Styling files
│   ├── package.json         # Dependencies and scripts
│   └── build/               # Production build output
├── Prototype/               # Simple HTML/CSS/JS prototype
├── docs/                    # Architecture and technical documentation
└── package-lock.json       # Root lockfile
```

## Development Commands

### Frontend Development
Navigate to `frontend/` directory for all React development:

```bash
cd frontend

# Start development server
npm start                    # Runs on http://localhost:3000

# Run tests
npm test                     # Interactive test runner
npm test -- --coverage      # Run with coverage report

# Build for production
npm run build               # Creates optimized build in build/

# Lint and format (inherited from CRA)
npm run test -- --watchAll=false  # Run tests once
```

### Application Modules and Data Structure

The application is organized around several key modules visible in the navigation:

- **Dashboard**: Overview with KPIs and summary charts
- **Tendances**: Trend analysis with evolution charts
- **Mots-clés**: Keyword management with word cloud and heatmap
- **Pôles**: Expertise areas with distribution charts
- **Méthodes**: Methodology management and process timeline
- **Références**: Project references with detailed filtering
- **Data**: Data source management
- **Illustrations**: Visual asset management
- **Outils**: Tool management with instructions
- **CVthèque**: CV/profile management
- **Compétences**: Skills matrix and competency management
- **IA Strategie**: AI Studio interface for document generation

### Data Management

All application data is currently managed through `frontend/src/data.js` which exports an `appData` object containing:

- **KPIs**: Total studies, keywords, poles, typologies
- **Time series data**: Annual evolution of studies
- **Categorical data**: Poles, typologies, keyword categories
- **Reference data**: Project references with full metadata
- **Resources**: CVs, competencies, methodologies, tools
- **Configuration data**: Data sources, illustrations, processes

## Key Components Architecture

### Main App Structure
- `App.js` contains all components in a single file following a modular component structure
- State management uses React hooks (useState, useEffect)
- Navigation between modules using tab-based interface
- Dark/light theme toggle functionality

### Data Visualization
- Extensive use of Chart.js components (Line, Doughnut, Bar, Pie charts)
- Custom chart configurations with consistent color schemes
- Responsive design with maintainAspectRatio: false

### Filtering and Search
- Multi-level filtering system across modules
- Search functionality with text matching
- Dynamic data filtering based on selected criteria

## Future Backend Integration

The application is designed to integrate with a future backend system featuring:

- **Architecture**: Microservices with API Gateway
- **Authentication**: JWT-based with multi-tenant isolation
- **AI Pipeline**: RAG (Retrieval-Augmented Generation) architecture
- **Data Storage**: PostgreSQL for metadata, Vector DB for embeddings, S3 for files
- **Technologies**: FastAPI, Kubernetes, GraphQL

## Development Guidelines

### Code Style
- Use functional components with hooks
- Maintain consistent component naming (PascalCase)
- Follow React best practices for state management
- Use ES6+ features (arrow functions, destructuring, template literals)

### Component Structure
- Each major feature is implemented as a dedicated component
- Shared utilities and configurations at module level
- Consistent prop patterns for filters and data display

### Data Handling
- All data currently static in `data.js`
- Components designed for easy transition to API calls
- Consistent data structure patterns across modules

### Testing
- Test files follow `*.test.js` pattern
- Use React Testing Library for component testing
- Jest for unit tests

## Important Notes

- **Single File Architecture**: The main App.js contains all components - this was an initial development approach
- **Static Data**: All data is currently static and will need backend integration
- **Multi-tenant Ready**: Architecture designed for "One WikiPro = One Entity" principle
- **AI-First Design**: Interface components ready for AI-powered features
- **Responsive Design**: Mobile-friendly interface with modern CSS

## Common Development Tasks

### Adding New Data
1. Update `frontend/src/data.js` with new data structures
2. Ensure consistent naming and structure with existing data
3. Update related components to handle new data fields

### Adding New Features
1. Create new component in App.js following existing patterns
2. Add navigation tab in Navigation component
3. Add corresponding TabContent entry in MainContent
4. Implement filtering and search if applicable

### Chart Modifications
1. Chart configurations are inline within components
2. Use consistent `chartColors` array for styling
3. Maintain responsive design patterns
4. Follow Chart.js v4 API patterns

### Styling Changes
1. CSS follows component-based organization
2. CSS custom properties used for theming
3. Dark/light theme support via data-color-scheme attribute
4. Font Awesome classes for icons

The application is well-structured for future backend integration while maintaining a rich, interactive frontend experience with comprehensive data visualization capabilities.