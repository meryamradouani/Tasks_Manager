# Tests Backend - Task Manager

## Installation des dépendances de test

```bash
npm install
```

## Exécution des tests

### Exécuter tous les tests avec couverture
```bash
npm test
```

### Exécuter les tests en mode watch
```bash
npm run test:watch
```

## Couverture de code

Les tests génèrent automatiquement un rapport de couverture dans le dossier `coverage/`.

- **Rapport HTML**: Ouvrez `coverage/lcov-report/index.html` dans votre navigateur
- **Rapport LCOV**: Utilisé par SonarCloud (`coverage/lcov.info`)

## Structure des tests

Les tests sont organisés par contrôleur:

- `controllers/authController.test.js` - Tests d'authentification
- `controllers/taskController.test.js` - Tests de gestion des tâches
- `controllers/userController.test.js` - Tests de gestion des utilisateurs
- `controllers/reportController.test.js` - Tests de génération de rapports

## Configuration

La configuration Jest se trouve dans `jest.config.js`.

## Intégration avec SonarCloud

Les rapports de couverture sont automatiquement envoyés à SonarCloud via le fichier `coverage/lcov.info`.
