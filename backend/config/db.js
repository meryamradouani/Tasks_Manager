
const mongoose=require("mongoose");
//connection to databse
async function connectdb(){
    try {
        console.log("Tentative de connexion à MongoDB...");
await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000, // 30s timeout
  connectTimeoutMS: 30000 // 30s pour la connexion initiale
});
    console.log("✅ Connecté à MongoDB !");
    } catch (error) {
        console.error("❌ Database connection error:", error);
    }
}
module.exports=connectdb;