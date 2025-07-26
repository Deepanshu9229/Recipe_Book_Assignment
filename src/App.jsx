import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Favorites from './components/Favorites';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/login" element={<Login />} /> 
          <Route path="/favorites" element={<Favorites/>} />
        </Routes>
        <ToastContainer position="top-center" />
      </Router>
    </AuthProvider>
  );
}