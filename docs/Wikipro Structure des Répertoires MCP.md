# **1\. Structure des Répertoires MCP :**

/wikipro-project/  
├ ──  /mcp-tools/  
│    ├ ──  /architecte/ (Docker, K8s, Monitoring)  
│    ├ ──  /backend/ (NestJS, PostgreSQL, JWT)  
│    ├ ──  /ia-rag/ (LlamaIndex, Pinecone, LLMs)  
│    ├ ──  /frontend/ (React, GraphQL, UI)  
│    ├ ──  /devops/ (Terraform, CI/CD, Cloud)  
│    ├ ──  /qa/ (Testing, Performance, Security)  
│   └── /professeur/ (Knowledge Base, Best Practices)  
├ ──  /agents-config/  
│    ├ ──  agent-architecte.json  
│    ├ ──  agent-backend.json  
│    ├ ──  agent-ia-rag.json  
│   └── ...  
└── /shared-context/  
     ├ ──  wikipro-specs.md  
     ├ ──  architecture-decisions.md  
     └── coordination-rules.md

2\. Configuration des Agents : 

Chaque agent aura son fichier de configuration avec : 

* Ses MCP spécifiques 

* Son plan de travail détaillé 

* Ses responsabilités précises

* Ses points de coordination

3\. Système de Coordination :

* Daily standup automatisé via MCP

* Status tracking en temps réel

* Escalation automatique vers le Professeur

* Validation gates aux moments clés  
