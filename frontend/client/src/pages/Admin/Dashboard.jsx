import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import apiPaths from '../../utils/apiPaths';
import { useUser } from '../../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const STATUS_COLORS = {
  pending: 'text-purple-700 bg-purple-100',
  'in-progress': 'text-blue-700 bg-blue-100',
  completed: 'text-green-700 bg-green-100',
};
const PRIORITY_COLORS = {
  high: 'text-red-700 bg-red-100',
  medium: 'text-yellow-700 bg-yellow-100',
  low: 'text-green-700 bg-green-100',
};

const Dashboard = () => {
  useUserAuth();
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(apiPaths.tasks.get_dashboard_data);
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError("Erreur lors du chargement des données",err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
  });

  const stats = dashboardData?.statistics || {};
  const charts = dashboardData?.charts || {};
  const recentTasks = dashboardData?.recentTasks || [];

  // Données pour le Doughnut (Task Distribution)
  const doughnutData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [
          charts.taskDescribution?.pending || 0,
          charts.taskDescribution?.['in-progress'] || 0, // <-- avec tiret
          charts.taskDescribution?.completed || 0,
        ],
        backgroundColor: ['#a78bfa', '#60a5fa', '#34d399'],
        borderWidth: 1,
      },
    ],
  };

  // Données pour le Bar (Priority Levels)
  const barData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks',
        data: [
          charts.taskPrioritylevels?.high || 0,
          charts.taskPrioritylevels?.medium || 0,
          charts.taskPrioritylevels?.low || 0,
        ],
        backgroundColor: ['#f87171', '#fbbf24', '#34d399'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1">Good Morning! {user?.name?.split(' ')[0] || 'Admin'}</h2>
          <div className="text-gray-500 text-sm">{dateStr}</div>
        </div>

        {/* Error message */}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {loading && <div className="text-center mb-4">Chargement...</div>}

   
        {/* Stat Cards */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[180px] bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            <div>
              <div className="text-xs text-gray-500">Total Tasks</div>
              <div className="text-lg font-bold">{stats.totalTasks || 0}</div>
            </div>
          </div>
          <div className="flex-1 min-w-[180px] bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            <div>
              <div className="text-xs text-gray-500">Pending Tasks</div>
              <div className="text-lg font-bold">{stats.pendingtasks || 0}</div>
            </div>
          </div>
          <div className="flex-1 min-w-[180px] bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            <div>
              <div className="text-xs text-gray-500">In Progress Tasks</div>
              <div className="text-lg font-bold">{stats.inProgresstasks || 0}</div>
            </div>
          </div>
          <div className="flex-1 min-w-[180px] bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            <div>
              <div className="text-xs text-gray-500">Completed Tasks</div>
              <div className="text-lg font-bold">{stats.completedtasks || 0}</div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Doughnut Chart: Task Distribution */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h4 className="font-semibold mb-4">Task Distribution</h4>
            <div style={{ width: 300, height: 300 }}>
              <Doughnut
                data={doughnutData}
                options={{
                  plugins: { legend: { position: 'bottom' } },
                  maintainAspectRatio: false,
                  responsive: false,
                }}
                width={300}
                height={300}
              />
            </div>
          </div>
          {/* Bar Chart: Priority Levels */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Priority Levels</h4>
            <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
          </div>
        </div>

        {/* Recent Tasks Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Tasks</h3>
            <button
              onClick={() => navigate('/admin/tasks')}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded font-medium text-sm transition"
            >
              See All
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 12H6.75m6 6 6-6-6-6" />
              </svg>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 px-2">Name</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Priority</th>
                  <th className="py-2 px-2">Created On</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-400">No recent tasks</td></tr>
                )}
                {recentTasks.map((task, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium text-gray-900">{task.title}</td>
                    <td className="py-2 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[task.status] || ''}`}>
                        {task.status === 'completed' ? 'Completed' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[task.priority] || ''}`}>
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
    </DashboardLayout>
  );
};

export default Dashboard;
