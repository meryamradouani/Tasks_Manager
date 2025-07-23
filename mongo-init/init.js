// Script d'initialisation MongoDB
db = db.getSiblingDB('taskmanager');

// Créer des collections si elles n'existent pas
db.createCollection('users');
db.createCollection('tasks');

// Créer des index pour améliorer les performances
db.users.createIndex({ "email": 1 }, { unique: true });
db.tasks.createIndex({ "userId": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "createdAt": -1 });

print('Base de données taskmanager initialisée avec succès!'); 