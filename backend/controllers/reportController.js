const asyncHandler = require("express-async-handler");
const { User } = require("../models/User");
const { Task } = require("../models/Task");
const ExcelJS = require("exceljs");

// @desc    Export all tasks as an Excel file 
// @route   GET /api/reports/export/tasks
// @access  Private (admin)
const exportTaskReport = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", 'name email');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");

    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "Assigned To", key: "assignedTo", width: 40 }
    ];

    tasks.forEach(task => {
      const assignedTo = task.assignedTo 
        ? task.assignedTo.map(user => `${user.name} (${user.email})`).join(", ")
        : "Unassigned";

      worksheet.addRow({
        _id: task._id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        description: task.description || '',
        dueDate: task.dueDate?.toISOString().split("T")[0] || '',
        assignedTo: assignedTo
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=tasks_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ 
      message: "Error exporting tasks", 
      error: error.message 
    });
  }
});

// @desc    Export users report with task statistics
// @route   GET /api/reports/export/users
// @access  Private (admin)
const exportUsersReport = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select("name email");
    const tasks = await Task.find().populate("assignedTo", "name email");

    const userTaskMap = {};
    users.forEach(user => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0
      };
    });

    tasks.forEach(task => {
      if (task.assignedTo) {
        task.assignedTo.forEach(assignedUser => {
          if (userTaskMap[assignedUser._id]) {
            userTaskMap[assignedUser._id].taskCount += 1;
            switch(task.status) {
              case "Pending":
                userTaskMap[assignedUser._id].pendingTasks += 1;
                break;
              case "In Progress":
                userTaskMap[assignedUser._id].inProgressTasks += 1;
                break;
              case "Completed":
                userTaskMap[assignedUser._id].completedTasks += 1;
                break;
            }
          }
        });
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Task Report");

    worksheet.columns = [
      { header: "User Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 40 },
      { header: "Total Tasks", key: "taskCount", width: 20 },
      { header: "Pending", key: "pendingTasks", width: 20 },
      { header: "In Progress", key: "inProgressTasks", width: 20 },
      { header: "Completed", key: "completedTasks", width: 20 }
    ];

    Object.values(userTaskMap).forEach(user => {
      worksheet.addRow(user);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ 
      message: "Error exporting users report", 
      error: error.message 
    });
  }
});

// @desc    Export current user's tasks
// @route   GET /api/reports/export/my-tasks
// @access  Private
const exportMyTasksReport = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignedTo: req.user._id 
    }).populate("assignedTo", "name email");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("My Tasks Report");

    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Due Date", key: "dueDate", width: 20 }
    ];

    tasks.forEach(task => {
      worksheet.addRow({
        _id: task._id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        description: task.description || '',
        dueDate: task.dueDate?.toISOString().split("T")[0] || ''
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=my_tasks_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ 
      message: "Error exporting my tasks", 
      error: error.message 
    });
  }
});

module.exports = { 
  exportTaskReport,
  exportUsersReport,
  exportMyTasksReport
};