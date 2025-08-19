import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';

const DashboardPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Card>
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}</h2>
        <p>Your premium access is active until: {user?.subscriptionExpiry}</p>
      </Card>
    </div>
  );
};

export default DashboardPage;