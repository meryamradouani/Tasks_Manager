require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectdb = require("./config/db");
const path = require("path");

// Configuration CORS - DOIT être avant les autres middlewares
app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origin (comme Postman) ou depuis localhost
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(null, true); // En production, remplacer par callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware pour parser JSON et URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à la base de données
connectdb();

//route
const authRoutes=require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes");
const taskRoutes=require("./routes/taskRoutes")
const reportRoutes=require("./routes/reportRoutes")

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.use("/uploads",express.static(path.join(__dirname,"uploads")))

// Écoute sur le port
app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Serveur en cours d'exécution sur http://0.0.0.0:${process.env.PORT || 8000}`);
});