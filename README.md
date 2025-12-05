# Psy2Bib - Plateforme de Consultation Psychologique 🔐

## ✅ Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur : **http://localhost:5173/**

## 📁 Structure du Projet CORRIGÉE

```
psy2bib-frontend/
├── index.html                 # Page HTML principale
├── package.json               # Dépendances npm
├── vite.config.js             # Configuration Vite
└── src/
    ├── index.js               # Point d'entrée React
    ├── App.js                 # Composant principal avec routes
    ├── styles.css             # Styles CSS globaux
    │
    ├── utils/
    │   └── crypto.js          # ✅ Fonctions de chiffrement E2EE
    │
    ├── components/
    │   ├── Topbar.js          # Barre de navigation
    │   └── Footer.js          # Pied de page
    │
    └── pages/
        ├── common/            # Pages accessibles à tous
        │   ├── Home.js        # Page d'accueil
        │   ├── About.js       # À propos
        │   ├── SearchPsy.js   # Recherche de psychologues
        │   ├── Appointments.js # Gestion des RDV
        │   ├── Messages.js    # Messagerie E2EE
        │   └── Visio.js       # Visio avec avatar 3D
        │
        ├── patient/           # Pages patient
        │   ├── Login.js       # ✅ Connexion patient
        │   ├── Register.js    # ✅ CORRIGÉ - Inscription patient
        │   └── Dashboard.js   # Tableau de bord patient
        │
        └── psy/               # Pages psychologue
            ├── Login.js       # ✅ Connexion psy
            ├── Register.js    # ✅ Inscription psy
            └── Dashboard.js   # ✅ Tableau de bord psy
```

## 🔒 Fonctionnalités Principales

### ✨ Chiffrement Zero-Knowledge
- **PBKDF2** : 100k itérations pour dériver la clé AES-256
- **AES-GCM** : Chiffrement local dans le navigateur
- **Serveur aveugle** : Ne peut jamais lire vos données

### 🎭 Visio Avatar 3D
- Consultations avec avatar animé
- Votre visage n'est jamais transmis
- MediaPipe pour le tracking facial

### 💬 Messagerie E2EE
- Messages chiffrés de bout en bout
- Le serveur ne voit que des blobs opaques

## 🧪 Tester l'Application

### En tant que Patient
1. Allez sur **http://localhost:5173/**
2. Cliquez sur "Espace Patient"
3. Cliquez sur "S'inscrire"
4. Remplissez le formulaire (vos données seront chiffrées)
5. Explorez votre dashboard

### En tant que Psychologue
1. Allez sur **http://localhost:5173/**
2. Cliquez sur "Espace Psychologue"
3. Cliquez sur "S'inscrire"
4. Remplissez vos informations professionnelles
5. Accédez à votre agenda

## 🔑 Architecture de Sécurité

### Pipeline de Chiffrement

```
[Navigateur]
     ↓
Mot de passe → PBKDF2(salt, 100k) → Clé AES-256
     ↓
AES-GCM (chiffrement local)
     ↓
Données chiffrées
     ↓
[Serveur "aveugle"]
```

### Ce qui est chiffré E2EE
- ✅ Prénom, nom, téléphone
- ✅ Date de naissance
- ✅ Numéro ADELI (pour les psy)
- ✅ Notes de consultation
- ✅ Messages patient ↔ psy
- ✅ Historique des RDV

### Ce qui est stocké en clair
- ✅ Email (pour l'authentification)
- ✅ Hash du mot de passe (SHA-256)
- ✅ Salt (pour re-dériver la clé)

## ⚡ Commandes npm

```bash
npm run dev      # Lancer en mode développement
npm run build    # Créer le build de production
npm run preview  # Prévisualiser le build
```

## 🐛 Dépannage

### Problème : Page blanche
**Solution** : Vérifiez la console (F12) pour les erreurs

### Problème : "Module not found"
**Solution** : Supprimez `node_modules` et lancez `npm install`

### Problème : Port 5173 déjà utilisé
**Solution** : Modifiez le port dans `vite.config.js`

## 📝 Notes Importantes

### Mode Démo
Cette version utilise `localStorage` pour simuler un backend. En production :
- Les données chiffrées seraient dans **PostgreSQL**
- Le backend **NestJS** ne possède aucune clé
- **Row Level Security** protège l'accès

### Sécurité
- La clé AES **ne quitte JAMAIS** le navigateur
- Le serveur stocke uniquement des blobs chiffrés
- Impossible de récupérer les données sans le mot de passe

## 💡 Différences Patient vs Psychologue

### Patient
- Recherche de psychologues
- Prise de RDV
- Messages avec son psy
- Historique consultations

### Psychologue
- Agenda des RDV
- Liste de patients (anonymisés)
- Messages avec patients
- Notes chiffrées E2EE

## 🚀 Prochaines Étapes

1. Tester l'inscription patient
2. Tester l'inscription psy
3. Tester la messagerie E2EE
4. Tester la visio avatar
5. Vérifier que les données sont bien chiffrées dans localStorage

## 📧 Support

Si vous rencontrez des problèmes :
1. Vérifiez que tous les fichiers sont dans `/src`
2. Vérifiez la console navigateur (F12)
3. Assurez-vous que `npm install` s'est terminé sans erreur

