import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AppPage from './AppPage';
import TripsPage from './TripsPage';
import TripDetailsPage from './TripDetailsPage';
import SettingsPage from './SettingsPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <AppPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trips" 
          element={
            <ProtectedRoute>
              <TripsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trips/:id" 
          element={
            <ProtectedRoute>
              <TripDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
