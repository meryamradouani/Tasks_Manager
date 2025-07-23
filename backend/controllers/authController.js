const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {User}= require("../models/User")
const asynchandler = require("express-async-handler");

// generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '356d',
    });
};

// @desc    register un utilisateur
// @route   POST /api/auth/register
// @access  Public
const registerUser = asynchandler(async (req, res) => {
    const { name, email, password, profile } = req.body;

    // Validation des champs requis
    if (!name || !email || !password) {
        return res.status(400).json({ message:'Veuillez fournir tous les champs requis'});
    }

    // Vérification de l'existence de l'utilisateur
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà'});
    }

    // Détermination du rôle
    let role = "user";
    if (email === process.env.ADMIN_EMAIL) {
        role = "admin";
    }

    // Hashage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Création de l'utilisateur
    const user = await User.create({
        name,
        email,
        profile,
        password: hashedPassword,
        role
    });

    // Réponse avec token
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        role: user.role,
        token: generateToken(user)
    });
});


// @desc    login un utilisateur
// @route   POST /api/auth/login
// @access  Public
const LoginUser=asynchandler(async(req,res)=>{
    const {email, password } = req.body;

    // Validation des champs requis
    if (!email || !password) {
        return res.status(400).json({ message:'Veuillez fournir tous les champs requis'});
    }
    
    // verifier email
    const useremail= await User.findOne({email})
    if(!useremail){
        return res.status(400).json({message:"Email non trouvé"})
    }
    
    //verifier password
    const isPasswordMatch = await bcrypt.compare(password, useremail.password);
    if(!isPasswordMatch){
        return res.status(400).json({message:"Mot de passe incorrect"})
    }
    
    // Si l'email et le mot de passe sont corrects, renvoyer les informations de l'utilisateur
    res.status(200).json({
        _id: useremail._id,
        name:useremail.name,
        email:useremail.email,
        profile:useremail.profile,
        role:useremail.role,
        token: generateToken(useremail) // Générer et renvoyer le token JWT
    })
})


// @desc    logout un utilisateur
// @route   GET /api/auth/logout
// @access  Public
const logoutUser=async(req,res)=>{
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Expire immédiatement
    });
    res.status(200).json({ message: 'Déconnexion réussie' });
}

// @desc    get profile un utilisateur
// @route   GET /api/auth/profile
// @access  private
const getUserprofile=asynchandler(async(req,res)=>{
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        return res.status(404).json({message:'Utilisateur non trouvé'});
    }
    res.status(200).json(user);
})

// @desc    update profile un utilisateur
// @route   PUT /api/auth/profile
// @access  private(require jwt)
const updateUserProfile = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé'});
    }

    const { name, email, profile } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;
    user.profile = profile || user.profile;

    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile,
        role: updatedUser.role,
        token: generateToken(updatedUser)
    });
});

// @desc    Demande de réinitialisation du mot de passe
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asynchandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Veuillez fournir votre email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email' });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 heure

    // Sauvegarder le token dans la base de données
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // En production, vous devriez envoyer un email ici
    // Pour le moment, on retourne le token (à supprimer en production)
    res.status(200).json({
        message: 'Un email de réinitialisation a été envoyé',
        resetToken: resetToken, // À supprimer en production
        resetUrl: `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`
    });
});

// @desc    Réinitialisation du mot de passe
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asynchandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Veuillez fournir le token et le nouveau mot de passe' });
    }

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    // Hashage du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Supprimer les tokens de réinitialisation
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
});


module.exports={
    registerUser,
    LoginUser,
    logoutUser,
    getUserprofile,
    updateUserProfile,
    forgotPassword,
    resetPassword
}