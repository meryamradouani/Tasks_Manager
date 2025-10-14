import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import apiPaths from '../../utils/apiPaths';
import { useUser } from '../../hooks/useUser';
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

const ManageTask = () => {
  useUserAuth(); // Ajouter l'authentification
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching tasks for user...');
      const res = await axiosInstance.get(apiPaths.tasks.get_all_tasks);
      console.log('Tasks response:', res.data);
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.response?.data?.message || 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = activeTab === 'all'
    ? tasks
    : tasks.filter((t) => t.status === activeTab);

  if (error) {
    return (
      <DashboardLayout activeMenu="My Tasks">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Erreur</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchTasks}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mes Tâches</h2>
          <div className="text-sm text-gray-500">
            Connecté en tant que: {user?.name} ({user?.role})
          </div>
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
          <div className="text-center text-gray-400 py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Chargement des tâches...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune tâche trouvée</h3>
            <p className="text-gray-500">
              {activeTab === 'all' 
                ? "Vous n'avez pas encore de tâches assignées." 
                : `Aucune tâche avec le statut "${activeTab}" trouvée.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-100 cursor-pointer hover:shadow-lg transition"
                onClick={() => navigate(`/user/task/${task._id}`)}
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
                    Tâches faites : {task.todoChecklist?.filter(t => t.completed).length || 0} / {task.todoChecklist?.length || 0}
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
                    <span className="font-medium text-gray-600">Date de début</span>
                    <div>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Date limite</span>
                    <div>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</div>
                  </div>
                </div>
                
                {/* Assigned Users */}
                {task.assignedTo && task.assignedTo.length > 0 && (
                  <div className="flex items-center mt-3 gap-1">
                    {task.assignedTo.slice(0, 3).map((user) => (
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
                    {task.assignedTo.length > 3 && (
                      <span className="ml-2 text-xs text-gray-500">+{task.assignedTo.length - 3}</span>
                    )}
                  </div>
                )}
                
                {/* Subtasks count */}
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <span>📝</span>
                  <span>{task.todoChecklist?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageTask;