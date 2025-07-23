const {Task} = require("../models/Task");
const {User}=require("../models/User");
const asyncHandler = require("express-async-handler");
// @desc    get all user
// @route   get /api/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({role:'user'}).select('-password');
    // add task to each user
    // promise : effectue 3 requêtes de comptage en paralele
    const usersWithTaskCounts = await Promise.all(users.map(async (user) => {
        const pendingTask=await Task.countDocuments({assignedTo:user._id ,status:"pending"});
        const inProgressTask=await Task.countDocuments({assignedTo:user._id ,status:"in-progress"})
        const completedTask=await Task.countDocuments({assignedTo:user._id ,status:"completed"})
      return{
        ...user._doc , //contient tout les donnes de user
        pendingTask,
        inProgressTask,
        completedTask
      }
    }))
    res.json(usersWithTaskCounts);
  })
// @desc    get user by id
// @route   get /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  // Récupérer les statistiques des tâches en parallèle
  const [pendingTask, inProgressTask, completedTask] = await Promise.all([
    Task.countDocuments({ assignedTo: user._id, status: "pending" }),
    Task.countDocuments({ assignedTo: user._id, status: "in-progress" }),
    Task.countDocuments({ assignedTo: user._id, status: "completed" }),
  ]);

  // Construction de la réponse enrichie
  const userWithTaskCounts = {
    ...user._doc,
    pendingTask,
    inProgressTask,
    completedTask,
  };

  res.json(userWithTaskCounts);
});

// @desc     update user
// @route   put /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const user= User.findById(req.params.id)
    if(!user){
      
    }
})
// @desc     delete user
// @route    delete/api/users/:id
// @access  Private
const   deleteUser = asyncHandler(async (req, res) => {
    
})

// Exportez correctement
module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};