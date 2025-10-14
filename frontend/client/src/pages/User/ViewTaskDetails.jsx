import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { useUser } from '../../hooks/useUser';
import { FiArrowLeft, FiCheck, FiClock, FiUser, FiCalendar, FiEdit } from 'react-icons/fi';
import { DEFAULT_PROFILE_IMAGE } from '../../utils/config';

const ViewTaskDetails = () => {
  useUserAuth(); // Ajouter l'authentification
  const { user } = useUser(); // Ajouter l'utilisateur
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching task details for ID:', id);
      console.log('Current user:', user);
      const response = await axiosInstance.get(`/api/tasks/${id}`);
      console.log('Task details response:', response.data);
      setTask(response.data);
    } catch (error) {
      console.error('Error fetching task details:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 403) {
        setError('Vous n\'êtes pas autorisé à accéder à cette tâche');
      } else if (error.response?.status === 404) {
        setError('Tâche non trouvée');
      } else if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError('Erreur lors du chargement des détails de la tâche');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (todoIndex) => {
    if (!task) return;

    const updatedTask = { ...task };
    updatedTask.todoChecklist[todoIndex].completed = !updatedTask.todoChecklist[todoIndex].completed;

    try {
      const response = await axiosInstance.put(`/api/tasks/${id}/todo`, {
        todoChecklist: updatedTask.todoChecklist
      });
      setTask(response.data.updatedTask);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-purple-100 text-purple-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="Task Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    return (
      <DashboardLayout activeMenu="Task Details">
        <div className="p-6">
          <div className="text-red-500 text-center">{error || 'Tâche non trouvée'}</div>
        </div>
      </DashboardLayout>
    );
  }

  const completedTodos = task.todoChecklist?.filter(todo => todo.completed).length || 0;
  const totalTodos = task.todoChecklist?.length || 0;
  const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  return (
    <DashboardLayout activeMenu="Task Details">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <FiArrowLeft />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{task.title}</h1>
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate(`/admin/edit-task/${id}`)}
              className="ml-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <FiEdit />
              Modifier
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{task.description}</p>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Progression</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{completedTodos} sur {totalTodos} tâches terminées</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Todo Checklist */}
              {task.todoChecklist && task.todoChecklist.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Liste des tâches</h3>
                  {task.todoChecklist.map((todo, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                      onClick={() => handleToggleTodo(index)}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        todo.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {todo.completed && <FiCheck className="text-white text-sm" />}
                      </div>
                      <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                        {todo.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Pièces jointes</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {task.attachments.map((attachment, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <img
                        src={attachment}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Informations</h2>
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <FiClock className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(task.status)}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-3">
                  <FiClock className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Priorité</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date limite</p>
                    <p className="text-sm font-medium">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Non définie'}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Créée le</p>
                    <p className="text-sm font-medium">
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Users */}
            {task.assignedTo && task.assignedTo.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Assignés</h2>
                <div className="space-y-3">
                  {task.assignedTo.map((user) => (
                    <div key={user._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <img
                          src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_PROFILE_IMAGE;
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;