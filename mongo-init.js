// Création de l'admin applicatif
db.getSiblingDB('admin').createUser({
  user: "meryam@admin.com",
  pwd: "meryam1234",
  roles: [
    { role: "readWrite", db: "TaskManager" },
    { role: "dbAdmin", db: "TaskManager" },
    { role: "clusterMonitor", db: "admin" }
  ]
});

// Création de la base de données avec une collection initiale
db.getSiblingDB('TaskManager').createCollection('users');