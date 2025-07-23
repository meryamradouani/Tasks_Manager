require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectdb = require("./config/db");
const path = require("path"); // ✅ Manquait dans ton code

app.use(cors({
  origin: "http://localhost:5173", // autorise ton frontend Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // si tu utilises des cookies
}));
app.use(express.json()); // Pour parser le JSON


//route
const authRoutes=require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes");
const taskRoutes=require("./routes/taskRoutes")
const reportRoutes=require("./routes/reportRoutes")
// Middleware essentiels
app.use(express.urlencoded({ extended: true })); // Pour les formulaires
// Connexion à la base de données
connectdb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);


app.use("/uploads",express.static(path.join(__dirname,"uploads")))



// Écoute sur le port 3000
app.listen(process.env.PORT || 8000, '0.0.0.0', () => {
    console.log(`Serveur en cours d'exécution sur http://0.0.0.0:${process.env.PORT || 8000}`);
});