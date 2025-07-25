import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComparisonPage from './pages/ComparisonPage';
import CompareIndexPage from './pages/CompareIndexPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/compare" element={<CompareIndexPage />} />
      <Route path="/compare/:slug" element={<ComparisonPage />} />
    </Routes>
  );
}

export default App;