import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';

const ManageUsers = () => {
  useUserAuth(); // Ajouter l'authentification
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get('/api/users');
        setTeamMembers(res.data);
      } catch (err) {
        setError(`Erreur lors du chargement des membres: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDownloadUsersReport = async () => {
    try {
      const response = await axiosInstance.get('/api/reports/export/users', {
        responseType: 'blob', // important pour les fichiers
      });
      // Crée un lien de téléchargement temporaire
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Nom du fichier (à adapter selon le backend)
      link.setAttribute('download', 'users_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erreur lors du téléchargement du rapport utilisateurs.",err);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Team Members</h2>
          <button
            onClick={handleDownloadUsersReport}
            className="bg-green-100 text-green-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-green-200 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v2.25A2.25 2.25 0 0 1 17.25 18.75H6.75A2.25 2.25 0 0 1 4.5 16.5v-2.25m15-6V7.5A2.25 2.25 0 0 0 17.25 5.25H6.75A2.25 2.25 0 0 0 4.5 7.5v.75m15 0L12 15.75m0 0L7.5 11.25m4.5 4.5V3.75" />
            </svg>
            Download Report
          </button>
        </div>
        {loading ? (
          <div>Chargement...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="flex gap-6 flex-wrap">
            {teamMembers.map((member) => (
              <div key={member._id} className="bg-white rounded-lg shadow p-6 w-80 flex flex-col items-center">
                <img
                  src={member.avatar || `https://ui-avatars.com/api/?name=${member.name || member.email}`}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover mb-3"
                />
                <div className="font-semibold text-lg mb-1">{member.name || member.email}</div>
                <div className="text-gray-500 text-sm mb-4">{member.email}</div>
                <div className="flex justify-between w-full mt-2">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-blue-600 font-bold">{member.pendingTask}</span>
                    <span className="text-xs text-gray-500">Pending</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-yellow-600 font-bold">{member.inProgressTask}</span>
                    <span className="text-xs text-gray-500">In Progress</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-green-600 font-bold">{member.completedTask}</span>
                    <span className="text-xs text-gray-500">Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;