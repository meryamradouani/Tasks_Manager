const express= require( 'express');
const { LoginUser, registerUser, updateUserProfile, logoutUser, getUserprofile, forgotPassword, resetPassword } =require ('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.Js');
const router=express.Router();
const upload = require('../middleware/uploadMiddleware.js');
const multer = require('multer'); // Added multer import

router.use(express.json());

router.post('/register', registerUser);
router.post('/login', LoginUser);
router.get('/logout', logoutUser);
router.get('/profile', protect, getUserprofile); // Récupère le profil utilisateur connecté
router.put('/profile', protect, updateUserProfile); // Met à jour le profil utilisateur connecté

// Routes pour la réinitialisation du mot de passe
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/upload-image', upload.single('image'), (req, res) => {
    if(!req.file){
        return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    } 
    const imageUrl= `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
}, (error, req, res, next) => {
    // Gestion des erreurs de multer (type de fichier non autorisé, etc.)
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Le fichier est trop volumineux' });
        }
        return res.status(400).json({ message: error.message });
    }
    
    if (error.message.includes('Type de fichier non autorisé')) {
        return res.status(400).json({ message: error.message });
    }
    
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload du fichier' });
});
module.exports = router;