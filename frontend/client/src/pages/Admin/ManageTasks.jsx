import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Link, useNavigate } from 'react-router-dom';
import { HiDownload } from 'react-icons/hi';
import { useUserAuth } from '../../hooks/useUserAuth';
import { DEFAULT_PROFILE_IMAGE } from '../../utils/config';

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
];

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const STATUS_COLORS = {
  pending: 'bg-purple-100 text-purple-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const ManageTasks = () => {
  useUserAuth(); // Ajouter l'authentification
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/tasks');
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Gérer l'erreur
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour télécharger le rapport des tâches
  const handleDownloadTasksReport = async () => {
    try {
      const response = await axiosInstance.get('/api/reports/export/tasks', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tasks_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erreur lors du téléchargement du rapport des tâches:', err);
      alert('Erreur lors du téléchargement du rapport des tâches.');
    }
  };

  const filteredTasks = activeTab === 'all'
    ? tasks
    : tasks.filter((t) => t.status === activeTab);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
          <button
            onClick={handleDownloadTasksReport}
            className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded font-medium hover:bg-green-200 transition"
          >
            <HiDownload className="text-lg" />
            Download Report
          </button>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-6 mb-8">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`relative font-medium px-2 pb-2 transition ${
                activeTab === tab.value
                  ? 'text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {tasks.filter((t) => t.status === tab.value).length}
                </span>
              )}
              {tab.value === 'all' && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Task Cards */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-400 py-20">No tasks found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition"
              >
                {/* Badges */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[task.status]}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
                {/* Title & Description */}
                <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{task.description}</p>
                {/* Progress */}
                <div className="mt-2 mb-1">
                  <div className="text-xs text-gray-500">
                    Task Done: {task.todoChecklist?.filter(t => t.completed).length || 0} / {task.todoChecklist?.length || 0}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          task.todoChecklist && task.todoChecklist.length > 0
                            ? (task.todoChecklist.filter(t => t.completed).length / task.todoChecklist.length) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                  <div>
                    <span className="font-medium text-gray-600">Start Date</span>
                    <div>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Due Date</span>
                    <div>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</div>
                  </div>
                </div>
                {/* Assigned Users */}
                <div className="flex items-center mt-3 gap-1">
                  {task.assignedTo?.slice(0, 3).map((user) => (
                    <div key={user._id} className="flex items-center gap-1">
                      <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                        <img
                          src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_PROFILE_IMAGE;
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{user.name}</span>
                    </div>
                  ))}
                  {task.assignedTo?.length > 3 && (
                    <span className="ml-2 text-xs text-gray-500">+{task.assignedTo.length - 3}</span>
                  )}
                </div>
                {/* Subtasks count */}
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <span>📝</span>
                  <span>{task.todoChecklist?.length || 0}</span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/admin/task/${task._id}`)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => navigate(`/admin/edit-task/${task._id}`)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;