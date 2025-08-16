// init-admin.js
const mongoose = require("mongoose");
const { User } = require("./models/User");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await User.create({
        name: "Super Admin",
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin"
      });
      console.log("✅ Admin par défaut créé !");
    } else {
      console.log("ℹ️ Admin existe déjà.");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Erreur init admin :", error);
    process.exit(1);
  }
}

createAdmin();
