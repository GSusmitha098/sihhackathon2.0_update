// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ token, children }) => {
  if (!token) {
    return <Navigate to="/" />; // redirect to login selection if not logged in
  }
  return children;
};

export default PrivateRoute;
