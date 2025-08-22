const fs = require('fs');
const path = require('path');

// Script pour corriger automatiquement les erreurs TypeScript dans les tests
const fixes = [
  // Correction des types dans les tests
  {
    file: 'src/ai-gateway/monitoring/ai-analytics.service.spec.ts',
    replacements: [
      { 
        from: /format: 'json'/g, 
        to: "format: ExportFormat.JSON" 
      },
      { 
        from: /metrics: \['cost'\]/g, 
        to: "metrics: [ExportMetricType.COST]" 
      },
      { 
        from: /'cost', 'performance'/g, 
        to: "ExportMetricType.COST, ExportMetricType.PERFORMANCE" 
      }
    ]
  },
  {
    file: 'src/ai-gateway/monitoring/ai-monitoring.controller.spec.ts',
    replacements: [
      { 
        from: /format: 'json'/g, 
        to: "format: ExportFormat.JSON" 
      },
      { 
        from: /period: 'last_7d'/g, 
        to: "period: ExportPeriod.LAST_7D" 
      },
      { 
        from: /metricsIncluded: \['cost', 'performance'\]/g, 
        to: "metricsIncluded: [ExportMetricType.COST, ExportMetricType.PERFORMANCE]" 
      },
      { 
        from: /metrics: readonly \["cost", "performance"\]/g, 
        to: "metrics: [ExportMetricType.COST, ExportMetricType.PERFORMANCE] as const" 
      }
    ]
  }
];

// Ajouter les imports nécessaires
const addImports = [
  {
    file: 'src/ai-gateway/monitoring/ai-analytics.service.spec.ts',
    import: "import { ExportFormat, ExportMetricType, ExportPeriod } from './dto/export-metrics.dto';"
  },
  {
    file: 'src/ai-gateway/monitoring/ai-monitoring.controller.spec.ts', 
    import: "import { ExportFormat, ExportMetricType, ExportPeriod } from './dto/export-metrics.dto';"
  }
];

// Fonction pour appliquer les corrections
function applyFixes() {
  console.log('🔧 Début des corrections TypeScript...');

  fixes.forEach(fix => {
    const filePath = path.join(__dirname, fix.file);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      fix.replacements.forEach(replacement => {
        content = content.replace(replacement.from, replacement.to);
      });
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Corrigé: ${fix.file}`);
    } else {
      console.log(`⚠️  Fichier non trouvé: ${fix.file}`);
    }
  });

  // Ajouter les imports
  addImports.forEach(importFix => {
    const filePath = path.join(__dirname, importFix.file);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (!content.includes('ExportFormat')) {
        // Ajouter l'import après les autres imports
        const importIndex = content.lastIndexOf("import");
        const nextLineIndex = content.indexOf('\n', importIndex);
        
        content = content.slice(0, nextLineIndex + 1) + 
                 importFix.import + '\n' + 
                 content.slice(nextLineIndex + 1);
        
        fs.writeFileSync(filePath, content);
        console.log(`📦 Import ajouté: ${importFix.file}`);
      }
    }
  });

  console.log('🎉 Corrections terminées !');
}

applyFixes();