import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

interface BookingData {
  match: {
    team1: string;
    team2: string;
    date: string;
    time: string;
    venue: string;
  };
  ticketType: string;
  price: number;
  quantity: number;
}

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Get booking data from location state or use default values
  const bookingData: BookingData = location.state?.bookingData || {
    match: {
      team1: "Gujarat Titans",
      team2: "Rajasthan Royals",
      date: "9 April 2025",
      time: "7:30 PM IST",
      venue: "Narendra Modi Stadium, Ahmedabad, Gujarat"
    },
    ticketType: "Premium Stand",
    price: 1999,
    quantity: 1
  };

  // Calculate pricing
  const baseAmount = bookingData.price * bookingData.quantity;
  const gstRate = 0.18; // 18% GST
  const gstAmount = Math.round(baseAmount * gstRate);
  const serviceFee = 75;
  const totalAmount = baseAmount + gstAmount + serviceFee;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare payment data
    const paymentData = {
      bookingData: {
        match: {
          team1: bookingData.match.team1,
          team2: bookingData.match.team2
        },
        ticketType: bookingData.ticketType,
        quantity: bookingData.quantity
      },
      totalAmount: totalAmount,
      customer: { fullName, email, phone }
    };
    
    // Navigate to payment options page
    navigate('/payment-options', { state: { paymentData } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="px-4 py-3 flex items-center">
          <Link to="/select-seats/match1" className="mr-4">
            <ArrowLeft className="w-5 h-5 text-[#333333]" />
          </Link>
          <span className="text-sm">Back</span>
        </div>
      </header>

      {/* Main Content - Added pt-16 for proper spacing */}
      <main className="pt-16 pb-6 px-4">
        <h1 className="text-2xl font-bold text-center my-4">Complete Your Booking</h1>
        
        {/* Booking Summary Section */}
        <div className="bg-white rounded-md shadow-sm mb-4">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Booking Summary</h2>
          </div>
          
          <div className="p-4">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600">Match:</td>
                  <td className="py-1 text-right font-medium">{bookingData.match.team1} vs {bookingData.match.team2}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Date & Time:</td>
                  <td className="py-1 text-right">{bookingData.match.date}, {bookingData.match.time}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Venue:</td>
                  <td className="py-1 text-right">{bookingData.match.venue}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Ticket Type:</td>
                  <td className="py-1 text-right text-blue-600 font-medium">{bookingData.ticketType}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Ticket Price:</td>
                  <td className="py-1 text-right">₹{bookingData.price} per ticket</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Quantity:</td>
                  <td className="py-1 text-right">{bookingData.quantity} tickets</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Base Amount:</td>
                  <td className="py-1 text-right">₹{baseAmount}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">GST (18%):</td>
                  <td className="py-1 text-right">₹{gstAmount}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Service Fee:</td>
                  <td className="py-1 text-right">₹{serviceFee}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="border-t mt-2 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-lg">₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Customer Information Section */}
        <div className="bg-white rounded-md shadow-sm mb-6">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Customer Information</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#eb4e62] focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#eb4e62] focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#eb4e62] focus:border-transparent"
                required
                pattern="[0-9]{10}"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">Enter a 10-digit mobile number without country code</p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#eb4e62] text-white py-3 rounded-md font-medium hover:bg-[#d43b4f] transition-colors"
            >
              Proceed To Pay ₹{totalAmount}
            </button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              By proceeding, you agree to our <a href="#" className="text-blue-600 underline">Terms & Conditions</a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default BookingConfirmation;
