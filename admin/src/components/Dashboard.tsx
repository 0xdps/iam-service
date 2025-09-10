import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalRoles: 0,
    totalPermissions: 0
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock data for now
      setStats({
        totalUsers: 150,
        totalGroups: 12,
        totalRoles: 8,
        totalPermissions: 45
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="stats">
        <div className="stat-card">
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalGroups}</h3>
          <p>Total Groups</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalRoles}</h3>
          <p>Total Roles</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalPermissions}</h3>
          <p>Total Permissions</p>
        </div>
      </div>
      
      <div className="card">
        <h3>Recent Activity</h3>
        <p>No recent activity to display.</p>
      </div>
      
      <div className="card">
        <h3>System Health</h3>
        <p>All services are running normally.</p>
      </div>
    </div>
  );
};

export default Dashboard;