import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import OAuthSuccess from './pages/OAuthSuccess';
import SBT from './pages/SBT';
import Tokenize from './pages/Tokenize';
import Portfolio from './pages/Portfolio';
import Security from './pages/Security';
import Layout from './components/Layout';

function App() {
  return (
      <Routes>
      {/* Public Routes */}
        <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

      {/* Protected Routes with shared layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tokenize"
        element={
          <ProtectedRoute>
            <Layout>
              <Tokenize />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portfolio"
        element={
          <ProtectedRoute>
            <Layout>
              <Portfolio />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sbt"
        element={
          <ProtectedRoute>
            <Layout>
              <SBT />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <Layout>
              <Security />
            </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}

export default App;
