# Psy2Bib - Plateforme de Consultation Psychologique 🔐

## ✅ Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

---

## 📁 Structure du Projet

```
psy2bib-frontend/
├── index.html                 # Page HTML principale + Script Argon2
├── package.json               # Dépendances npm
├── vite.config.js             # Configuration Vite
└── src/
    ├── index.js               # Point d'entrée React
    ├── App.js                 # Composant principal avec routes
    ├── styles.css             # Styles CSS globaux
    │
    ├── utils/
    │   └── crypto.js          # ✅ Chiffrement Argon2id + AES-256-GCM
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
        │   ├── Login.js       # ✅ Connexion patient (Argon2id)
        │   ├── Register.js    # ✅ Inscription patient (Argon2id)
        │   └── Dashboard.js   # Tableau de bord patient
        │
        └── psy/               # Pages psychologue
            ├── Login.js       # ✅ Connexion psy (Argon2id)
            ├── Register.js    # ✅ Inscription psy (Argon2id)
            └── Dashboard.js   # ✅ Tableau de bord psy
```

---

## 🔒 Fonctionnalités Principales

### ✨ Chiffrement Zero-Knowledge avec Argon2id

| Composant | Technologie | Description |
|-----------|-------------|-------------|
| **Dérivation de clé** | Argon2id | Memory-hard (64MB), résistant GPU/ASIC |
| **Chiffrement** | AES-256-GCM | Chiffrement authentifié |
| **Serveur** | Zero-Knowledge | Ne peut jamais lire vos données |

### ⚙️ Configuration Argon2id (OWASP 2024)

```
Type:        Argon2id (hybrid)
Mémoire:     64 MB (memory-hard)
Itérations:  3 (time cost)
Parallelism: 4 threads
Output:      256 bits (pour AES-256)
Salt:        16 bytes (aléatoire)
```

### 🎭 Visio Avatar 3D
- Consultations avec avatar animé
- Votre visage n'est jamais transmis
- MediaPipe pour le tracking facial
- WebRTC + DTLS-SRTP pour la transmission

### 💬 Messagerie E2EE
- Messages chiffrés de bout en bout
- Le serveur ne voit que des blobs opaques
- Chiffrement AES-256-GCM

---

## 🔑 Architecture de Sécurité

### Pipeline de Chiffrement Argon2id + AES-256

```
[Navigateur Client]
        |
   Mot de passe
        ↓
┌─────────────────────────────────────┐
│  ARGON2ID (Memory-Hard)             │
│  • Type: Argon2id (hybrid)          │
│  • Mémoire: 64 MB                   │
│  • Itérations: 3                    │
│  • Parallelism: 4                   │
│  • Output: 256 bits                 │
└─────────────────────────────────────┘
        ↓
    Clé AES-256
        ↓
┌─────────────────────────────────────┐
│  AES-256-GCM (Authenticated)        │
│  • IV: 12 bytes (random)            │
│  • Tag: 128 bits (authentification) │
└─────────────────────────────────────┘
        ↓
  Données chiffrées (blobs)
        ↓
[Serveur NestJS "aveugle"]
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
- ✅ Salt (pour re-dériver la clé Argon2id)

---

## 🆚 Pourquoi Argon2id plutôt que PBKDF2 ?

| Critère | PBKDF2 | Argon2id ✓ |
|---------|--------|------------|
| **Résistance GPU** | Moyenne (CPU-bound) | **Excellente** (memory-hard 64MB) |
| **Résistance ASIC** | Faible | **Excellente** |
| **Side-channel** | Non protégé | **Protégé** (hybrid) |
| **Standard** | NIST (2000) | **OWASP 2024, RFC 9106** |
| **Recommandation** | Acceptable | **Premier choix** |

---

## 🧪 Tester l'Application

### En tant que Patient
1. Allez sur **http://localhost:5173/**
2. Cliquez sur "Espace Patient"
3. Cliquez sur "S'inscrire"
4. Observez les messages :
   - "🔐 Génération de la clé Argon2id (64MB RAM)..."
   - "🔑 Dérivation Argon2id en cours..."
   - "✅ Inscription réussie !"
5. Explorez votre dashboard

### En tant que Psychologue
1. Allez sur **http://localhost:5173/**
2. Cliquez sur "Espace Psychologue"
3. Cliquez sur "S'inscrire"
4. Remplissez vos informations professionnelles
5. Accédez à votre agenda

### Vérification Argon2
Ouvrez la console navigateur (F12), vous devriez voir :
```
✅ Argon2 chargé avec succès
   Type: Argon2id (memory-hard, résistant GPU)
   Config: 64MB RAM, 3 itérations, parallelism 4
```

---

## ⚡ Commandes npm

```bash
npm run dev      # Lancer en mode développement
npm run build    # Créer le build de production
npm run preview  # Prévisualiser le build
```

---

## 🐛 Dépannage

### Problème : Page blanche
**Solution** : Vérifiez la console (F12) pour les erreurs

### Problème : "Module not found"
**Solution** : Supprimez `node_modules` et lancez `npm install`

### Problème : Port 5173 déjà utilisé
**Solution** : Modifiez le port dans `vite.config.js`

### Problème : "Argon2 non chargé"
**Solution** : Vérifiez que `index.html` contient le script :
```html
<script src="https://cdn.jsdelivr.net/npm/argon2-browser@1.18.0/dist/argon2-bundled.min.js"></script>
```

### Problème : Dérivation lente (~1-2 secondes)
**C'est normal !** Argon2id utilise 64MB de RAM pour résister aux attaques GPU.

---

## 📝 Notes Importantes

### Mode Démo
Cette version utilise `localStorage` pour simuler un backend. En production :
- Les données chiffrées seraient dans **PostgreSQL**
- Le backend **NestJS** ne possède aucune clé
- **Row Level Security** protège l'accès

### Sécurité Argon2id
- La clé AES **ne quitte JAMAIS** le navigateur
- Le serveur stocke uniquement des blobs chiffrés
- Impossible de récupérer les données sans le mot de passe
- **64MB de RAM** requis pour chaque tentative de crack (protection anti-GPU)

### Dépendance Argon2
```html
<!-- Chargé via CDN dans index.html -->
<script src="https://cdn.jsdelivr.net/npm/argon2-browser@1.18.0/dist/argon2-bundled.min.js"></script>
```

---

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

---

## 🛠️ Stack Technique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | React 18 + Vite |
| **UI** | Bootstrap 5 + CSS custom |
| **Dérivation clé** | **Argon2id** (argon2-browser) |
| **Chiffrement** | AES-256-GCM (Web Crypto API) |
| **Visio** | WebRTC + DTLS-SRTP |
| **Avatar** | MediaPipe Face Tracking |
| **Stockage (démo)** | localStorage |
| **Stockage (prod)** | PostgreSQL + RLS |

---

## 📚 Références

- [OWASP Password Storage Cheat Sheet 2024](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [RFC 9106 - Argon2](https://www.rfc-editor.org/rfc/rfc9106.html)
- [Password Hashing Competition (2015)](https://www.password-hashing.net/)
- [argon2-browser npm](https://www.npmjs.com/package/argon2-browser)

---

## 🚀 Prochaines Étapes

1. ✅ Tester l'inscription patient avec Argon2id
2. ✅ Tester l'inscription psy avec Argon2id
3. ✅ Tester la messagerie E2EE
4. ✅ Tester la visio avatar
5. ✅ Vérifier le message "Argon2 chargé avec succès" dans la console
6. ✅ Vérifier que les données sont bien chiffrées dans localStorage

---

## 📧 Support

Si vous rencontrez des problèmes :
1. Vérifiez que tous les fichiers sont dans `/src`
2. Vérifiez la console navigateur (F12)
3. Assurez-vous que `npm install` s'est terminé sans erreur
4. Vérifiez que le script Argon2 est chargé (message dans la console)

---

## 🏆 Challenge Startup 2025

Projet conforme au whitepaper et cahier des charges :
- ✅ Architecture Zero-Knowledge
- ✅ **Argon2id** pour la dérivation de clé (OWASP 2024)
- ✅ AES-256-GCM pour le chiffrement
- ✅ Visio Avatar 3D fonctionnel
- ✅ Messagerie E2EE
