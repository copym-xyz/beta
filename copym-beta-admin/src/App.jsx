import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Dashboard from './components/dashboard/Dashboard.jsx';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientLeadsManagement from './components/admin/ClientLeadsManagement';
import UserManagement from './components/admin/UserManagement';
import UserProfile from './components/admin/UserProfile';
import AssetManagement from './components/admin/AssetManagement';
import TokenManagement from './components/admin/TokenManagement';
import KYCManagement from './components/admin/KYCManagement';
import ComplianceCenter from './components/admin/ComplianceCenter';
import SecurityCenter from './components/admin/SecurityCenter';
import RegulatoryReports from './components/admin/RegulatoryReports';
import TransactionMonitor from './components/admin/TransactionMonitor';
import WalletManagement from './components/admin/WalletManagement';
import InvestmentManagement from './components/admin/InvestmentManagement';
import DIDManagement from './components/admin/DIDManagement';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  console.log('🔐 ProtectedRoute check:', {
    hasToken: !!token,
    userRole: userRole,
    isAdmin: userRole === 'ADMIN'
  });
  
  if (!token || userRole !== 'ADMIN') {
    console.log('❌ Access denied - redirecting to login');
    return <Navigate to="/" replace />;
  }
  
  console.log('✅ Access granted - rendering dashboard');
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<SignIn />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }>
            {/* Nested Dashboard Routes */}
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="clients" element={<ClientLeadsManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/:userId" element={<UserProfile />} />
            <Route path="assets" element={<AssetManagement />} />
            <Route path="tokens" element={<TokenManagement />} />
            <Route path="kyc" element={<KYCManagement />} />
            <Route path="compliance" element={<ComplianceCenter />} />
            <Route path="security" element={<SecurityCenter />} />
            <Route path="reports" element={<RegulatoryReports />} />
            <Route path="transactions" element={<TransactionMonitor />} />
            <Route path="wallets" element={<WalletManagement />} />
            <Route path="investments" element={<InvestmentManagement />} />
            <Route path="did" element={<DIDManagement />} />
          </Route>
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;