import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home.tsx'; 
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import PaymentOptions from './pages/PaymentOptions';
import "./main.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select-seats/:matchId" element={<SeatSelection />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/payment-options" element={<PaymentOptions />} />
      </Routes>
    </Router>
  );
}

export default App;
