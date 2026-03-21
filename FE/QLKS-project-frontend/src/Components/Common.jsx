import React, { Component } from "react";
import "../style/Common.css";

export const FeatureHeader = ({ title, description }) => {
  return (
    <div className="feature-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};

// export const AnotherComponent = () => {
//   return <div>Component khác</div>;
// };