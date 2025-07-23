const {Task }= require("../models/Task");
const { User } = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc    get all tasks
// @route   GET /api/tasks/
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let filter = {};
  if (status) filter.status = status;

  let tasks;

  if (req.user.role === "admin") {
    tasks = await Task.find(filter).populate("assignedTo", "name email profile");
  } else {
    tasks = await Task.find({ ...filter, assignedTo: req.user._id }).populate("assignedTo", "name email profile");
  }

  tasks = await Promise.all(tasks.map(async (task) => {
    const completedCount = task.todoChecklist.filter(item => item.completed).length;
    return {
      ...task._doc,
      completedTodoCount: completedCount
    };
  }));

  const baseFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };

  const allTasks = await Task.countDocuments(baseFilter);
  const pendingTasks = await Task.countDocuments({ ...baseFilter, status: "pending" });
  const inProgressTasks = await Task.countDocuments({ ...baseFilter, status: "in-progress" });
  const completedTasks = await Task.countDocuments({ ...baseFilter, status: "completed" });

  res.json({
    tasks,
    statusSummary: {
      all: allTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks
    }
  });
});

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  console.log('Getting task by ID:', req.params.id);
  console.log('Current user:', req.user);
  
  const task = await Task.findById(req.params.id).populate("assignedTo", "name email profile");
  if (!task) {
    console.log('Task not found');
    return res.status(404).json({ message: "Tâche non trouvée" });
  }

  console.log('Task found:', task);
  console.log('Task assignedTo:', task.assignedTo);
  console.log('Current user ID:', req.user._id.toString());

  // Vérifier si l'utilisateur a le droit d'accéder à cette tâche
  const isAssigned = task.assignedTo.some(userId => userId._id.toString() === req.user._id.toString());
  console.log('Is user assigned:', isAssigned);
  console.log('User role:', req.user.role);
  
  // Temporairement permettre à tous les utilisateurs de voir toutes les tâches
  // if (!isAssigned && req.user.role !== 'admin') {
  //   console.log('User not authorized');
  //   return res.status(403).json({ message: "Non autorisé à accéder à cette tâche" });
  // }

  console.log('User authorized, sending task');
  res.json(task);
});

// @desc    Create task (admin only)
// @route   POST /api/tasks/
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, assignedTo, attachments, priority, todoChecklist } = req.body;

  if (!Array.isArray(assignedTo)) {
    return res.status(400).json({ message: "assignedTo doit être un tableau" });
  }

  const task = await Task.create({
    title,
    description,
    dueDate,
    assignedTo,
    createdBy: req.user._id,
    attachments,
    priority,
    todoChecklist
  });

  res.status(200).json(task);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Tâche non trouvée" });
  }

  task.title = req.body.title || task.title;
  task.description = req.body.description || task.description;
  task.dueDate = req.body.dueDate || task.dueDate;
  task.attachments = req.body.attachments || task.attachments;
  task.priority = req.body.priority || task.priority;
  task.todoChecklist = req.body.todoChecklist || task.todoChecklist;

  if (req.body.assignedTo) {
    if (!Array.isArray(req.body.assignedTo)) {
      return res.status(400).json({ message: "assignedTo doit être un tableau" });
    }
    task.assignedTo = req.body.assignedTo;
  }

  const updatedTask = await task.save();
  res.status(200).json({ message: "Tâche mise à jour avec succès", updatedTask });
});

// @desc    Delete task (admin only)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Tâche non trouvée" });
  }
  res.status(200).json({ message: "Tâche supprimée avec succès", task });
});

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Tâche non trouvée" });
  }

  const isAssigned = task.assignedTo.some(userId => userId.toString() === req.user._id.toString());
  if (!isAssigned && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Non autorisé" });
  }

  task.status = req.body.status || task.status;

  if (task.status === "completed") {
    task.todoChecklist.forEach(item => item.completed = true);
    task.progress = 100;
  }

  await task.save();
  res.json({ message: "Statut mis à jour avec succès", task });
});

// @desc    Update task checklist
// @route   PUT /api/tasks/:id/todo
// @access  Private
const updateTaskCheklist = asyncHandler(async (req, res) => {
  const { todoChecklist } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Tâche non trouvée" });
  }

  const isAssigned = task.assignedTo.some(userId => userId.toString() === req.user._id.toString());
  if (!isAssigned && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Non autorisé" });
  }

  task.todoChecklist = todoChecklist;

  const completedCount = task.todoChecklist.filter(item => item.completed).length;
  const totalItems = task.todoChecklist.length;
  task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  if (task.progress === 100) {
    task.status = "completed";
  } else if (task.progress > 0) {
    task.status = "in-progress";
  } else {
    task.status = "pending";
  }

  await task.save();

  const updatedTask = await Task.findById(req.params.id).populate("assignedTo", "name email profile");
  res.json({ message: "Checklist mise à jour avec succès", updatedTask });
});

// @desc    Dashboard data (admin)
// @route   GET /api/tasks/dashboard-data
// @access  Private
const getDashboardData = asyncHandler(async (req, res) => {
  const totalTasks=await Task.countDocuments();
  const pendingtasks=await Task.countDocuments({status:"pending"})
  const inProgresstasks=await Task.countDocuments({status:"in-progress"})
  const completedtasks=await Task.countDocuments({status:"completed"})
  const overduetasks=await Task.countDocuments({
    status:{$ne:"completed"}, // not equal
    dueDate:{$lt:new Date()},// less than inferieur a la date actuelle
  })
  // ensure all possible status are included
  const taskStatuses= ["pending", "in-progress","completed"]
  const taskDescributionRaw = await Task.aggregate([
  {
    $group: {
      _id: "$status",       // Grouper par statut
      count: { $sum: 1 }    // Compter combien de tâches pour chaque statut
    }
  }
]);

  const taskDescribution=await taskStatuses.reduce((acc,status)=>{
    const formattedkey=status.replace(/\s+/g,"")//remove spaces*
    acc[formattedkey]=taskDescributionRaw.find((item)=> item._id===status)?.count || 0;
    return acc
  },{});

  taskDescribution["all"]=totalTasks
  // ensure all priority levels are included
  const taskPriorities= ["low", "medium","high"]
  const taskPrioritylevelsRaw = await Task.aggregate([
  {
    $group: {
      _id: "$priority",       // Grouper par statut
      count: { $sum: 1 }    // Compter combien de tâches pour chaque statut
    }
  }
]);
const taskPrioritylevels=await taskPriorities.reduce((acc,priority)=>{
    acc[priority]=taskPrioritylevelsRaw.find((item)=> item._id===priority)?.count || 0;
    return acc
  },{});

// fetch 10 tasks
const recentTasks=await Task.find().sort({createdAt:-1})
                                    .limit(10)
                                    .select("title status priority dueDate createdAt")

    res.status(200).json({
      statistics:{
        totalTasks,
        pendingtasks,
        inProgresstasks,
        completedtasks,
        overduetasks
      },
      charts:{
        taskDescribution,
        taskPrioritylevels
      },
      recentTasks
    })
});

// @desc    User dashboard data
// @route   GET /api/tasks/user-dashboard-data
// @access  Private
const getUserDashboardData = asyncHandler(async (req, res) => {
  const userId = req.user._id; // user logged in 

  // Statistiques générales
  const totalTasks = await Task.countDocuments({ assignedTo: userId });
  const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "pending" });
  const inProgressTasks = await Task.countDocuments({ assignedTo: userId, status: "in-progress" });
  const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "completed" });

  // Tâches en retard
  const overdueTasks = await Task.countDocuments({
    assignedTo: userId,
    status: { $ne: "completed" },
    dueDate: { $lt: new Date() }
  });

  // Distribution des statuts
  const taskStatuses = ["pending", "in-progress", "completed"];
  const taskDescributionRaw = await Task.aggregate([
    { $match: { assignedTo: userId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
  const taskDescribution = taskStatuses.reduce((acc, status) => {
    const formattedKey = status.replace(/\s+/g, "");
    acc[formattedKey] = taskDescributionRaw.find(item => item._id === status)?.count || 0;
    return acc;
  }, {});
  taskDescribution["all"] = totalTasks;

  // Priorité
  const taskPriorities = ["low", "medium", "high"];
  const taskPriorityLevelsRaw = await Task.aggregate([
    { $match: { assignedTo: userId } },
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 }
      }
    }
  ]);
  const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
    acc[priority] = taskPriorityLevelsRaw.find(item => item._id === priority)?.count || 0;
    return acc;
  }, {});

  // Dernières tâches
  const recentTasks = await Task.find({ assignedTo: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("title status priority dueDate createdAt");

  res.status(200).json({
    statistics: {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks
    },
    charts: {
      taskDescribution,
      taskPriorityLevels
    },
    recentTasks
  });
});

module.exports = {
  getTaskById,
  getTasks,
  createTask,
  updateTask,
  updateTaskCheklist,
  updateTaskStatus,
  getDashboardData,
  getUserDashboardData,
  deleteTask
};
