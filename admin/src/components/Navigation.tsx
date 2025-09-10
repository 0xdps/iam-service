import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="nav">
      <button 
        className={isActive('/dashboard') ? 'active' : ''}
        onClick={() => navigate('/dashboard')}
      >
        Dashboard
      </button>
      <button 
        className={isActive('/users') ? 'active' : ''}
        onClick={() => navigate('/users')}
      >
        Users
      </button>
      <button 
        className={isActive('/groups') ? 'active' : ''}
        onClick={() => navigate('/groups')}
      >
        Groups
      </button>
      <button 
        className={isActive('/roles') ? 'active' : ''}
        onClick={() => navigate('/roles')}
      >
        Roles
      </button>
      <button 
        className={isActive('/permissions') ? 'active' : ''}
        onClick={() => navigate('/permissions')}
      >
        Permissions
      </button>
      <button 
        className={isActive('/audit') ? 'active' : ''}
        onClick={() => navigate('/audit')}
      >
        Audit Logs
      </button>
      <button onClick={handleLogout} style={{ marginLeft: 'auto', backgroundColor: '#ff6b6b' }}>
        Logout
      </button>
    </nav>
  );
};

export default Navigation;