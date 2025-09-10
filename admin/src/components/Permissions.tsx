import React from 'react';

const Permissions: React.FC = () => {
  return (
    <div>
      <h2>Permissions Management</h2>
      <div className="card">
        <h3>All Permissions</h3>
        <p>Permissions management functionality will be implemented here.</p>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Resource</th>
              <th>Action</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>users.read</td>
              <td>users</td>
              <td>read</td>
              <td>View users</td>
            </tr>
            <tr>
              <td>users.write</td>
              <td>users</td>
              <td>write</td>
              <td>Create and update users</td>
            </tr>
            <tr>
              <td>users.delete</td>
              <td>users</td>
              <td>delete</td>
              <td>Delete users</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Permissions;