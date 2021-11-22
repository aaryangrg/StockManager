
import './App.css';
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";
import LoginPage from './components/login';
import MainPage from './MainPage';
import "bootstrap"
function App() {
  const [googleID,setGoogleID] = useState([{}])
  return (
    <BrowserRouter>
    <Routes>
      <Route path = "/login" element = {<LoginPage setterFunc = {id => setGoogleID(id)}/>}/>
      <Route path = "portfolio" element = {<MainPage googleID = {googleID}/>}/>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
