// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskCheklist,
  getDashboardData,
  getUserDashboardData
} = require('../controllers/taskController');

const { protect, admin } = require('../middleware/authMiddleware.Js');

// Routes principales
router.get("/dashboard-data",protect,admin,getDashboardData)
router.get("/user-dashboard-data",protect,getUserDashboardData)
router.post('/', protect, admin,createTask); // craete task (admin)
router.get('/', protect, getTasks); // get all tasks (admin , user:assigned)
router.get('/:id', protect, getTaskById);// get task bu id 
router.put('/:id', protect, updateTask);// update  task 
router.delete('/:id', protect,admin, deleteTask); // delete task (only admin)
router.put("/:id/status",protect,updateTaskStatus) // update task status
router.put("/:id/todo",protect,updateTaskCheklist) // update task checklist

module.exports = router;