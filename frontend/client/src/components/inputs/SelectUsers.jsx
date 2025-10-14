import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import apiPaths from '../../utils/apiPaths';
import { LuUser, LuUsers } from 'react-icons/lu';
import { DEFAULT_PROFILE_IMAGE } from '../../utils/config';

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(apiPaths.users.get_all_users);
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const handleToggle = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Utilisateurs sélectionnés (pour affichage avatars)
  const selectedUsersData = allUsers.filter(u => selectedUsers.includes(u._id));

  return (
    <div className="space-y-2 mt-2 relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <LuUsers className="text-lg" />
        {selectedUsers.length > 0 ? 'Modifier les utilisateurs' : 'Choisir utilisateurs'}
      </button>
      {/* Avatars sélectionnés */}
      {selectedUsersData.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsersData.map((user) => (
            <div key={user._id} className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full border-2 border-blue-500 shadow-sm">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-200">
                <img
                  src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_PROFILE_IMAGE;
                  }}
                />
              </div>
              <span className="text-xs text-blue-700 font-medium">{user.name}</span>
            </div>
          ))}
        </div>
      )}
      {/* Liste stylée dropdown */}
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border-4 border-blue-400 bg-white shadow-2xl divide-y divide-blue-100 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-blue-500 font-medium p-4">Chargement...</div>
          ) : allUsers.length === 0 ? (
            <div className="text-gray-400 p-4">Aucun utilisateur trouvé.</div>
          ) : (
            allUsers.map((user) => {
              const isSelected = selectedUsers.includes(user._id);
              return (
                <label
                  key={user._id}
                  className={`flex items-center gap-3 py-3 px-4 cursor-pointer transition-all duration-150
                    rounded-xl mb-1
                    ${isSelected ? 'bg-blue-50 border-2 border-blue-500 shadow' : 'border border-gray-200 hover:border-blue-300 hover:bg-blue-50'}
                  `}
                  style={{ borderRadius: '1rem' }}
                >
                  <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200'}`}>
                    <img
                      src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_PROFILE_IMAGE;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors duration-150
                      ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(user._id)}
                      className="accent-white w-4 h-4 cursor-pointer"
                      style={{ accentColor: isSelected ? '#fff' : '#3b82f6' }}
                    />
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SelectUsers;