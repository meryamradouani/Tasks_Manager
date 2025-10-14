const express= require( 'express');
const { protect , admin } = require('../middleware/authMiddleware.Js');
const {exportTaskReport,exportUsersReport,exportMyTasksReport }=require("../controllers/reportController")
const router=express.Router();

router.get("/export/tasks",protect,admin,exportTaskReport);// export all task as excel/pdf 
router.get("/export/users",protect,admin,exportUsersReport); // export user task report
router.get("/export/my-tasks", protect, exportMyTasksReport);

module.exports = router;