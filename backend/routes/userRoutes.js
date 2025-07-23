const express= require( 'express');
const { protect } = require('../middleware/authMiddleware.Js');
const { admin } = require('../middleware/authMiddleware.Js');
const router=express.Router();
router.use(express.json());
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController.js');
// user routes
router.get("/",protect,admin,getUsers); // Récupère tous les utilisateurs
router.get("/:id",protect,getUserById); // Récupère un utilisateur par ID
router.put("/:id",protect,updateUser); // Met à jour un utilisateur par ID
router.delete("/:id",protect,admin,deleteUser); // Supprime un utilisateur par ID

module.exports = router;