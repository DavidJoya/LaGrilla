import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import CheckStatus from './pages/CheckStatus';
import Board from './pages/Board';
import Standings from './pages/Standings';
import Admin from './pages/Admin';
import AdminMatchdays from './pages/AdminMatchdays';
import AdminPayments from './pages/AdminPayments';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/check-status" element={<CheckStatus />} />
          <Route path="/board" element={<Board />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/matchdays" element={<AdminMatchdays />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
