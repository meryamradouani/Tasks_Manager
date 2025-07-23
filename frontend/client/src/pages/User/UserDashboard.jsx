import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import apiPaths from '../../utils/apiPaths';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useNavigate } from 'react-router-dom';
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
import CustomPieChart from '../../components/Charts/CustomPieChart';
import moment from 'moment';

const UserDashboard = () => {
  useUserAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getUserDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(apiPaths.tasks.get_user_dashboard_data);
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching user dashboard data:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="text-red-500 text-center">{error}</div>
      </DashboardLayout>
    );
  }

  // Préparer les données pour le PieChart
  const pieData = [
    { status: "Pending", count: dashboardData.charts?.taskDescribution?.pending || 0 },
    { status: "In Progress", count: dashboardData.charts?.taskDescribution?.["in-progress"] || 0 },
    { status: "Completed", count: dashboardData.charts?.taskDescribution?.completed || 0 }
  ];

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord utilisateur</h1>
        {dashboardData ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total des tâches</p>
                <p className="text-2xl font-bold text-blue-800">{dashboardData.statistics?.totalTasks || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-800">{dashboardData.statistics?.pendingTasks || 0}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600">En cours</p>
                <p className="text-2xl font-bold text-orange-800">{dashboardData.statistics?.inProgressTasks || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Terminées</p>
                <p className="text-2xl font-bold text-green-800">{dashboardData.statistics?.completedTasks || 0}</p>
              </div>
            </div>

            {/* Graphiques utilisateur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Pie Chart: Répartition des tâches */}
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <h4 className="font-semibold mb-4">Répartition des tâches</h4>
                <div style={{ width: 300, height: 300 }}>
                  <CustomPieChart
                    data={pieData}
                    colors={["#a78bfa", "#60a5fa", "#34d399"]}
                  />
                </div>
              </div>
              {/* Bar Chart: Priorité */}
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold mb-4">Niveaux de priorité</h4>
                <Bar
                  data={{
                    labels: ["High", "Medium", "Low"],
                    datasets: [
                      {
                        label: "Tâches",
                        data: [
                          dashboardData.charts?.taskPriorityLevels?.high || 0,
                          dashboardData.charts?.taskPriorityLevels?.medium || 0,
                          dashboardData.charts?.taskPriorityLevels?.low || 0,
                        ],
                        backgroundColor: ["#f87171", "#fbbf24", "#34d399"],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                  }}
                />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Tâches récentes</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tâches récentes</h3>
                <button
                  onClick={() => navigate('/user/mytask')}
                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded font-medium text-sm transition"
                >
                  Voir plus
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 12H6.75m6 6 6-6-6-6" />
                  </svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Nom</th>
                      <th className="py-2 px-2">Statut</th>
                      <th className="py-2 px-2">Priorité</th>
                      <th className="py-2 px-2">Créée le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentTasks?.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-6 text-gray-400">Aucune tâche récente</td></tr>
                    )}
                    {dashboardData.recentTasks?.map((task, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 px-2 font-medium text-gray-900">{task.title}</td>
                        <td className="py-2 px-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.status === 'completed' ? 'text-green-700 bg-green-100' :
                            task.status === 'in-progress' ? 'text-blue-700 bg-blue-100' :
                            'text-purple-700 bg-purple-100'
                          }`}>
                            {task.status === 'completed' ? 'Terminée' : task.status === 'in-progress' ? 'En cours' : 'En attente'}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.priority === 'high' ? 'text-red-700 bg-red-100' :
                            task.priority === 'medium' ? 'text-yellow-700 bg-yellow-100' :
                            'text-green-700 bg-green-100'
                          }`}>
                            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || ''}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          {task.createdAt ? moment(task.createdAt).format('D MMM YYYY') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center">Aucune donnée disponible</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;