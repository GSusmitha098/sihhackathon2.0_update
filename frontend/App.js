 // src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import LoginSelection from "./components/LoginSelection";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import MigrantDashboard from "./components/MigrantDashboard";
import DoctorDashboard from "./components/DoctorDashboard";

import { loginUser } from "./api";

// Local component to handle login/register route, and navigate after success
const LoginPage = ({
  actor,
  setActor,
  isRegistering,
  setIsRegistering,
  setToken,
  setUserFirstName,
  error,
  setError,
}) => {
  const navigate = useNavigate();
  const params = useParams();

  const effectiveActor = actor || params.actor;

  useEffect(() => {
    if (!actor && params.actor) {
      setActor(params.actor);
    }
  }, [actor, params.actor, setActor]);

  return (
    <>
      {isRegistering ? (
        <RegisterForm
          actor={effectiveActor}
          onRegisterSuccess={() => setIsRegistering(false)}
          onBack={() => setIsRegistering(false)}
        />
      ) : (
        <LoginForm
          actor={effectiveActor}
          onLoginSuccess={(user) => {
            const savedToken = localStorage.getItem("token");
            if (savedToken) setToken(savedToken);
            if (user?.firstName) {
              setUserFirstName(user.firstName);
              localStorage.setItem("firstName", user.firstName);
            }

            // Delay navigation one tick so state updates propagate and route guards see the token
            setTimeout(() => {
              if (effectiveActor === "migrant") {
                navigate("/migrant-dashboard");
              } else if (effectiveActor === "doctor") {
                navigate("/doctor-dashboard");
              }
            }, 0);
          }}
          onRegisterClick={() => setIsRegistering(true)}
          setError={setError}
        />
      )}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
    </>
  );
};

// App component
const App = () => {
  const [actor, setActor] = useState(null); // "migrant" or "doctor"
  const [token, setToken] = useState(null);
  const [userFirstName, setUserFirstName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    // Check if user already logged in
    const savedToken = localStorage.getItem("token");
    const savedFirstName = localStorage.getItem("firstName");
    if (savedToken && savedFirstName) {
      setToken(savedToken);
      setUserFirstName(savedFirstName);
    }
  }, []);

  // Navigate after token state updates to avoid route guard race conditions
  useEffect(() => {
    if (token && redirectTo) {
      // perform navigation by using window.location or react-router navigate indirectly
      // We can't call navigate here (hook not available), so we'll rely on components to redirect
      // Instead, set redirectTo to null after token is set; the LoginPage will navigate immediately when called.
      setRedirectTo(null);
    }
  }, [token, redirectTo]);

  const logout = () => {
    setToken(null);
    setUserFirstName("");
    setActor(null);
    setIsRegistering(false);
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
  };

  return (
    <Routes>
      {/* Step 1: Select role */}
      <Route path="/" element={<LoginSelection onSelect={setActor} />} />

      {/* Step 2: Login / Register */}
      <Route
        path="/login/:actor"
        element={
          <LoginPage
            actor={actor}
            setActor={setActor}
            isRegistering={isRegistering}
            setIsRegistering={setIsRegistering}
            setToken={setToken}
            setUserFirstName={setUserFirstName}
            error={error}
            setError={setError}
          />
        }
      />

      {/* Step 3: Dashboards */}
      <Route
        path="/migrant-dashboard"
        element={
          token ? (
            <MigrantDashboard
              token={token}
              firstName={userFirstName}
              onLogout={logout}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/doctor-dashboard"
 
        element={
          token ? (
            <DoctorDashboard
              token={token}
              firstName={userFirstName}
              onLogout={logout}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Wrapper ensures Router context is available
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
