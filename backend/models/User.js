const mongoose = require('mongoose');

// Schéma pour définir le modèle User
const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        unique:true,
    },
    password:{
        type:String,
        required: true,
        minlength: 6,
    },
    profile:{
        type: String,
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    }
}, {timestamps:true});

// Création du modèle
const User = mongoose.model("User", UserSchema);

// Exportation du modèle
module.exports = { User };
