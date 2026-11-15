import ResQChatbot from "./components/ResQChatbot";
import EarthquakeSusceptibility from './pages/EarthquakeSusceptibility';
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import ProtectedRoute from './components/ProtectedRoute';

import {
  SurvivorDashboard,
  RescueDashboard,
  SurvivorReport,
  SurvivorUpdates,
  SurvivorCamps,
  RescueReports,
  RescueCamps,
  RescueMovement
} from './pages/Dashboards';

function Unauthorized() {
  return (
    <main className="not-found">
      <h1>Access Restricted</h1>
      <p>
        Your account does not have permission
        to access this workspace.
      </p>
      <a href="/">Return Home</a>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Survivor portal */}
        <Route
          path="/survivor"
          element={
            <ProtectedRoute role="SURVIVOR">
              <SurvivorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/survivor/report"
          element={
            <ProtectedRoute role="SURVIVOR">
              <SurvivorReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/survivor/updates"
          element={
            <ProtectedRoute role="SURVIVOR">
              <SurvivorUpdates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/survivor/camps"
          element={
            <ProtectedRoute role="SURVIVOR">
              <SurvivorCamps />
            </ProtectedRoute>
          }
        />

        {/* Rescue portal */}
        <Route
          path="/rescue"
          element={
            <ProtectedRoute role="RESCUE_TEAM">
              <RescueDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rescue/reports"
          element={
            <ProtectedRoute role="RESCUE_TEAM">
              <RescueReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rescue/camps"
          element={
            <ProtectedRoute role="RESCUE_TEAM">
              <RescueCamps />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rescue/movement"
          element={
            <ProtectedRoute role="RESCUE_TEAM">
              <RescueMovement />
            </ProtectedRoute>
          }
        />

        {/* Admin currently uses Django Admin */}
        <Route
          path="/admin-dashboard"
          element={<Navigate to="http://127.0.0.1:8000/admin/" replace />}
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
        {/* Earthquake Risk Intelligence */}

        <Route
          path="/survivor/earthquake-map"
          element={
            <ProtectedRoute role="SURVIVOR">
              <EarthquakeSusceptibility />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rescue/earthquake-map"
          element={
            <ProtectedRoute role="RESCUE_TEAM">
              <EarthquakeSusceptibility />
            </ProtectedRoute>
          }
        />

      </Routes>
      {sessionStorage.getItem("resqmap_access") && <ResQChatbot />}
    </BrowserRouter>
  );
}
