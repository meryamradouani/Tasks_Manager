import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { PRIORITY_DATA } from '../../utils/data';
import SelectDropdown from '../../components/inputs/SelectDropdown';
import SelectUsers from '../../components/inputs/SelectUsers';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { FiUpload, FiPlus, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { useUserAuth } from '../../hooks/useUserAuth';

const STATUS_DATA = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
];

const CreateTask = () => {
  useUserAuth(); // Ajouter l'authentification
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: [],
    progress: 0,
    attachments: [],
    todoChecklist: [],
  });
  const [loading, setLoading] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [todoInput, setTodoInput] = useState('');

  const handleChange = (name, value) => {
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const clearData = () => {
    setTaskData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending',
      assignedTo: [],
      progress: 0,
      attachments: [],
      todoChecklist: [],
    });
    setAttachmentFiles([]);
    setTodoInput('');
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
    setTaskData((prev) => ({
      ...prev,
      todoChecklist: [
        ...prev.todoChecklist,
        { text: todoInput, completed: false },
      ],
    }));
    setTodoInput('');
  };

  const handleRemoveTodo = (idx) => {
    setTaskData((prev) => ({
      ...prev,
      todoChecklist: prev.todoChecklist.filter((_, i) => i !== idx),
    }));
  };

  const handleToggleTodo = (idx) => {
    setTaskData((prev) => ({
      ...prev,
      todoChecklist: prev.todoChecklist.map((todo, i) =>
        i === idx ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  };

  const createTask = async () => {
    setLoading(true);
    try {
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
            // Continuer avec les autres fichiers
          }
        }
      }
      const payload = {
        ...taskData,
        attachments: uploadedFiles,
      };
      await axiosInstance.post('/api/tasks', payload);
      toast.success('Task created successfully!');
      clearData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (!taskData.title.trim()) {
      toast.error('Le titre de la tâche est requis');
      return;
    }
    if (!taskData.description.trim()) {
      toast.error('La description de la tâche est requise');
      return;
    }
    if (!taskData.dueDate) {
      toast.error('La date limite est requise');
      return;
    }
    if (taskData.assignedTo.length === 0) {
      toast.error('Au moins un utilisateur doit être assigné');
      return;
    }
    
    await createTask();
  };

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 text-white">
              <h1 className="text-2xl font-bold">Create New Task</h1>
              <p className="opacity-90">Fill in the details below to create a new task</p>
            </div>
            
            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
              {/* Title and Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={taskData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter task description"
                    required
                  />
                </div>
              </div>
              
              {/* Priority, Status, and Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <SelectDropdown
                    options={PRIORITY_DATA}
                    value={taskData.priority}
                    onChange={({ target }) => handleChange('priority', target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <SelectDropdown
                    options={STATUS_DATA}
                    value={taskData.status}
                    onChange={({ target }) => handleChange('status', target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress: {taskData.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={taskData.progress}
                    onChange={(e) => handleChange('progress', Number(e.target.value))}
                    className="w-full h-2 bg-white rounded-lg  cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
              
              {/* Due Date and Assignees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={taskData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <SelectUsers
                    selectedUsers={taskData.assignedTo}
                    setSelectedUsers={(users) => handleChange('assignedTo', users)}
                    placeholder="Select team members"
                  />
                </div>
              </div>
              
              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                  <div className="space-y-1 text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload files</span>
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
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">Images, PDF, Word, Excel, texte jusqu'à 10MB</p>
                  </div>
                </div>
                
                {attachmentFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachmentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {/* Icône selon le type de fichier */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Checklist</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    placeholder="Add a checklist item"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                  />
                  <button
                    type="button"
                    onClick={handleAddTodo}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="mr-1" /> Add
                  </button>
                </div>
                
                {taskData.todoChecklist.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {taskData.todoChecklist.map((todo, idx) => (
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
                  onClick={clearData}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Task'}
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

export default CreateTask;