// src/components/LoginSelection.js
import React from "react";
import { useNavigate } from "react-router-dom";

const LoginSelection = ({ onSelect }) => {
  const navigate = useNavigate();

  const handleSelect = (actor) => {
    onSelect(actor);
    navigate(`/login/${actor}`);
  };

  

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 80,
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f6fa",
        padding: 50,
        borderRadius: 10,
        maxWidth: 400,
        margin: "auto",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      

      <h2 style={{ color: "#2c3e50", marginBottom: 40 }}>Login as</h2>

      <button
        onClick={() => handleSelect("migrant")}
        style={{
          backgroundColor: "#27ae60",
          color: "#fff",
          padding: "12px 30px",
          marginRight: 20,
          border: "none",
          borderRadius: 6,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Migrant
      </button>

      <button
        onClick={() => handleSelect("doctor")}
        style={{
          backgroundColor: "#2980b9",
          color: "#fff",
          padding: "12px 30px",
          border: "none",
          borderRadius: 6,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Doctor
      </button>
    </div>
  );
};

export default LoginSelection;
