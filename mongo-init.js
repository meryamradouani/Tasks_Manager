// Ce script s'exécute dans le contexte de MONGO_INITDB_DATABASE (TaskManager)
// mais nous devons créer l'utilisateur dans la base admin

db = db.getSiblingDB('admin');

// Vérifier si l'utilisateur existe déjà
const userExists = db.getUser('admin');

if (!userExists) {
    db.createUser({
        user: 'admin',
        pwd: 'admin123',
        roles: [
            { role: 'root', db: 'admin' },
            { role: 'readWrite', db: 'TaskManager' }
        ]
    });
    print('✅ Admin user created successfully');
} else {
    print('ℹ️ Admin user already exists');
}

// Basculer vers la base TaskManager et créer les collections
db = db.getSiblingDB('TaskManager');

db.createCollection('users');
db.createCollection('tasks');
db.createCollection('projects');

print('✅ Database TaskManager initialized successfully');