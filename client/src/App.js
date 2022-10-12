// Local imports
import './App.css';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

// Imports from React
import { React } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path ='/' element = { <LandingPage/> }/>
                <Route path ='/dashboard' element = { <Dashboard/> }/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
