
# Test Technique Backend - Extraction de Métadonnées d'Images via IA

## 📋 Vue d'ensemble

### Contexte
Vous disposez d'une application Next.js existante avec :
- Une interface d'upload d'images déjà implémentée
- Une base de données PostgreSQL configurée avec Prisma
- Une clé API OpenAI configurée
- Docker Compose pour l'environnement de développement

### Objectif
Implémenter la logique backend pour :
1. Récupérer l'image uploadée
2. Extraire les informations via l'API OpenAI Vision
3. Sauvegarder les métadonnées en base de données

## 🔧 Spécifications Techniques

### Modèle de Données
```prisma
// Schema Prisma (à ajouter au schema.prisma existant)
model DocumentAnalysis {
  id        String   @id @default(cuid())
  fileName  String
  metadata  Json
  createdAt DateTime @default(now())
}
```

### Fonction d'Analyse
```typescript
// Type attendu pour la fonction d'analyse
async function analyzeDocument(
  file: File
): Promise<{
  fileName: string;
  metadata: {
    documentType?: string;
    documentNumber?: string;
    holderName?: string;
    issueDate?: string;
    expiryDate?: string;
    // autres métadonnées pertinentes
  };
}>
```

### Exemple de Réponse Attendue
```json
{
  "fileName": "carte-identite.jpg",
  "metadata": {
    "documentType": "carte_identite",
    "documentNumber": "990234567",
    "holderName": "JEAN DUPONT",
    "issueDate": "2020-01-15",
    "expiryDate": "2030-01-15",
    "birthDate": "1990-05-20",
    "nationality": "FRANÇAISE"
  }
}
```

## ✅ Critères d'Évaluation

### 1. Qualité du Code
- Typage TypeScript correct
- Gestion des erreurs
- Code clair et commenté

### 2. Utilisation de l'IA
- Prompt engineering efficace
- Traitement approprié des réponses
- Gestion des cas d'échec

### 3. Gestion des Données
- Validation des données extraites
- Stockage correct en base de données
- Format de données cohérent

## 📚 Ressources Fournies
- Projet Next.js configuré
- Page d'upload fonctionnelle
- Configuration Prisma et Docker
- Clé API OpenAI
- Documentation de l'API Vision d'OpenAI

## ⏱️ Temps Estimé
2-3 heures

## 📝 Notes Importantes
- Concentrez-vous sur la qualité de l'extraction des données
- Assurez une gestion robuste des erreurs
- Documentez les choix de prompt engineering

## 🚀 Pour Commencer

1. Clonez le repository
2. Installez les dépendances : `pnpm install`
3. Lancez la base de données : `docker-compose up -d`
4. Démarrez le serveur de développement : `pnpm dev`
5. Ouvrez [http://localhost:3000](http://localhost:3000)

## 📦 Livrable Attendu

- Un Pull Request sur le repository contenant :
    - Le modèle Prisma ajouté
    - L'implémentation de la fonction d'analyse
    - La documentation de vos choix de prompt
    - Les tests si vous en avez ajoutés

## 🔒 Contraintes Techniques
- Utiliser uniquement les dépendances existantes
- Respecter la structure du projet
- Suivre les conventions de code existantes