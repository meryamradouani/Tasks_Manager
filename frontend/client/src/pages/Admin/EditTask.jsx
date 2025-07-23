import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { PRIORITY_DATA, STATUS_DATA } from '../../utils/data';
import SelectDropdown from '../../components/inputs/SelectDropdown';
import SelectUsers from '../../components/inputs/SelectUsers';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { FiUpload, FiPlus, FiTrash2, FiX, FiCheck, FiArrowLeft, FiSave } from 'react-icons/fi';

const EditTask = () => {
  useUserAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [todoInput, setTodoInput] = useState('');

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching task details for ID:', id);
      const response = await axiosInstance.get(`/api/tasks/${id}`);
      console.log('Task details response:', response.data);
      setTask(response.data);
    } catch (error) {
      console.error('Error fetching task details:', error);
      if (error.response?.status === 403) {
        setError('Vous n\'êtes pas autorisé à modifier cette tâche');
      } else if (error.response?.status === 404) {
        setError('Tâche non trouvée');
      } else {
        setError('Erreur lors du chargement des détails de la tâche');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachmentFiles(files);
  };

  const removeAttachment = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTodo = () => {
    if (todoInput.trim() === '') return;
    setTask((prev) => ({
      ...prev,
      todoChecklist: [
        ...prev.todoChecklist,
        { text: todoInput, completed: false },
      ],
    }));
    setTodoInput('');
  };

  const handleRemoveTodo = (idx) => {
    setTask((prev) => ({
      ...prev,
      todoChecklist: prev.todoChecklist.filter((_, i) => i !== idx),
    }));
  };

  const handleToggleTodo = (idx) => {
    setTask((prev) => ({
      ...prev,
      todoChecklist: prev.todoChecklist.map((todo, i) =>
        i === idx ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  };

  const updateTask = async () => {
    setSaving(true);
    try {
      // Validation des champs requis
      if (!task.title.trim()) {
        toast.error('Le titre de la tâche est requis');
        return;
      }
      if (!task.description.trim()) {
        toast.error('La description de la tâche est requise');
        return;
      }
      if (!task.dueDate) {
        toast.error('La date limite est requise');
        return;
      }
      if (task.assignedTo.length === 0) {
        toast.error('Au moins un utilisateur doit être assigné');
        return;
      }

      let uploadedFiles = [];
      if (attachmentFiles.length > 0) {
        for (const file of attachmentFiles) {
          try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await axiosInstance.post('/api/auth/upload-image', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            uploadedFiles.push(res.data.imageUrl);
          } catch (uploadError) {
            console.error('Error uploading file:', file.name, uploadError);
            const errorMessage = uploadError.response?.data?.message || `Erreur lors de l'upload de ${file.name}`;
            toast.error(errorMessage);
          }
        }
      }

      const payload = {
        title: task.title.trim(),
        description: task.description.trim(),
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        progress: task.progress,
        assignedTo: task.assignedTo,
        attachments: [...(task.attachments || []), ...uploadedFiles],
        todoChecklist: task.todoChecklist
      };

      console.log('Updating task with payload:', payload);
      const response = await axiosInstance.put(`/api/tasks/${id}`, payload);
      console.log('Task updated successfully:', response.data);
      
      toast.success('Tâche mise à jour avec succès !');
      navigate('/admin/tasks');
    } catch (err) {
      console.error('Error updating task:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour de la tâche';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateTask();
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="Edit Task">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    return (
      <DashboardLayout activeMenu="Edit Task">
        <div className="p-6">
          <div className="text-red-500 text-center">{error || 'Tâche non trouvée'}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Edit Task">
      <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/admin/tasks')}
                  className="flex items-center gap-2 text-white hover:text-blue-100 transition"
                >
                  <FiArrowLeft />
                  Retour
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Modifier la Tâche</h1>
                  <p className="opacity-90">Modifiez les détails de la tâche</p>
                </div>
              </div>
            </div>
            
            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
              {/* Title and Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la Tâche <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Entrez le titre de la tâche"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={task.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Entrez la description de la tâche"
                    required
                  />
                </div>
              </div>
              
              {/* Priority, Status, and Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <SelectDropdown
                    options={PRIORITY_DATA}
                    value={task.priority}
                    onChange={({ target }) => handleChange('priority', target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <SelectDropdown
                    options={STATUS_DATA}
                    value={task.status}
                    onChange={({ target }) => handleChange('status', target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progression: {task.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    onChange={(e) => handleChange('progress', Number(e.target.value))}
                    className="w-full h-2 bg-white rounded-lg cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
              
              {/* Due Date and Assignees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Limite <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigner à</label>
                  <SelectUsers
                    selectedUsers={task.assignedTo}
                    setSelectedUsers={(users) => handleChange('assignedTo', users)}
                    placeholder="Sélectionner les membres de l'équipe"
                  />
                </div>
              </div>
              
              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pièces jointes</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                  <div className="space-y-1 text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Ajouter des fichiers</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                          className="sr-only"
                          onChange={handleAttachmentChange}
                        />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">Images, PDF, Word, Excel, texte jusqu'à 10MB</p>
                  </div>
                </div>
                
                {/* Existing attachments */}
                {task.attachments && task.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Pièces jointes existantes</h4>
                    <div className="space-y-2">
                      {task.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 flex items-center justify-center rounded bg-blue-100">
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <a
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate max-w-xs block"
                            >
                              Pièce jointe {index + 1}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New attachments */}
                {attachmentFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Nouvelles pièces jointes</h4>
                    {attachmentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded bg-blue-100">
                            {file.type.startsWith('image/') ? (
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            ) : file.type === 'application/pdf' ? (
                              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 truncate max-w-xs block">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB • {file.type}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Checklist */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Liste de contrôle</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    placeholder="Ajouter un élément à la liste"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                  />
                  <button
                    type="button"
                    onClick={handleAddTodo}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="mr-1" /> Ajouter
                  </button>
                </div>
                
                {task.todoChecklist && task.todoChecklist.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {task.todoChecklist.map((todo, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => handleToggleTodo(idx)}
                            className={`w-5 h-5 rounded flex items-center justify-center ${todo.completed ? 'bg-green-500 text-white' : 'border border-gray-300'}`}
                          >
                            {todo.completed && <FiCheck size={14} />}
                          </button>
                          <span className={`${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {todo.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTodo(idx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <FiX size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/tasks')}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </DashboardLayout>
  );
};

export default EditTask; 