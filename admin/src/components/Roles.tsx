import React from 'react';

const Roles: React.FC = () => {
  return (
    <div>
      <h2>Roles Management</h2>
      <div className="card">
        <h3>All Roles</h3>
        <p>Roles management functionality will be implemented here.</p>
        <ul>
          <li>admin - Full administrative access</li>
          <li>user - Standard user access</li>
          <li>viewer - Read-only access</li>
        </ul>
      </div>
    </div>
  );
};

export default Roles;