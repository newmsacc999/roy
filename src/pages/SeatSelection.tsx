import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';

interface MatchData {
  id: string;
  date: string;
  time: string;
  team1: {
    name: string;
    logo: string;
  };
  team2: {
    name: string;
    logo: string;
  };
  venue: string;
}

function SeatSelection() {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'map' | 'tickets'>('map');
  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] = useState<'grid' | 'buttons' | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const stadiumMaps = {
    "Narendra Modi Stadium, Ahmedabad": "https://www.xchangetickets.com/seatingplans/venue_1030.jpg",
    "Wankhede Stadium, Mumbai": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR86hIAs0iAFefSIJI8nzx_nOL0DngCUQXA1GN3fcwY1GYjQ6JV8Zy48Jw&s=10",
    "M. Chinnaswamy Stadium, Bengaluru": "https://cdn.shopify.com/s/files/1/0278/4565/6649/files/WhatsApp_Image_2023-10-02_at_18.06.17.webp",
    "Eden Gardens, Kolkata": "https://ipltickets.in/wp-content/uploads/2024/02/kolkata-eden-gardens-stadium-stands-pavilions-seat-chart.jpg",
    "MA Chidambaram Stadium, Chennai": "https://pbs.twimg.com/media/GmX9vH4bAAA8JCs?format=jpg",
    "Arun Jaitley Stadium, Delhi": "https://www.xchangetickets.co.uk/seatingplans/venue_1154.jpg",
    "Rajiv Gandhi International Stadium, Hyderabad": "https://assets.isu.pub/document-structure/230315054443-5af6010b1e320f4688b2f873e7154667/v1/4e43fccb3dabbcc2559d4ca250350baf.jpeg",
    "Sawai Mansingh Stadium, Jaipur": "https://indiaongo.in/wp-content/uploads/2018/04/sms-stadium-jaipur-seating-layout-arrangements.png",
    "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow": "https://inputsmatters.com/wp-content/uploads/2026/03/Bharat-Ratna-Shri-Atal-Bihari-Vajpayee-Ekana-Cricket-Stadium-Lucknow-Layout1.jpg",
    "New International Cricket Stadium, New Chandigarh": "https://indiaongo.in/wp-content/uploads/2024/03/new-pca-stadium-mullanpur-mohali.jpeg",
    "ACA Stadium, Guwahati": "https://indiaongo.in/wp-content/uploads/2017/10/aca-cricket-stadium-barsapara-guwahati-assam-layout.jpg",
  };
  
  // This would come from your match data
  const matchData: MatchData = location.state?.match || {
    id: "match1",
    date: "9 April 2025",
    time: "7:30 PM IST",
    team1: {
      name: "Gujarat Titans",
      logo: "https://upload.wikimedia.org/wikipedia/en/0/09/Gujarat_Titans_Logo.svg",
    },
    team2: {
      name: "Rajasthan Royals",
      logo: "https://upload.wikimedia.org/wikipedia/en/6/60/Rajasthan_Royals_Logo.svg",
    },
    venue: "Narendra Modi Stadium, Ahmedabad, Gujarat",
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Upper grid ticket types
  const ticketTypes = [
    { id: 'general', name: 'General Stand', price: 999, available: 85 },
    { id: 'premium', name: 'Premium Stand', price: 999, available: 100 },
    { id: 'pavilion', name: 'Pavilion Stand', price: 999, available: 50 },
    { id: 'vip', name: 'VIP Stand', price: 999, available: 100 },
    { id: 'corporate', name: 'Corporate Box', price: 999, available: 45 },
    { id: 'hospitality', name: 'Hospitality Box', price: 1500, available: 25 },
    { id: 'skybox', name: 'Skybox/Lounge', price: 1700, available: 30 },
    { id: 'premium-plus', name: 'Premium Plus', price: 1500, available: 60 },
    { id: 'executive', name: 'Executive Lounge', price: 999, available: 40 },
  ];
  
  // Bottom ticket types with different prices
  const bottomTicketTypes = [
    { id: 'general', name: 'General Stand', price: 599, description: 'Affordable seating, usually in the upper stands.' },
    { id: 'premium', name: 'Premium Stand', price: 999, description: 'Better view with comfortable seating.' },
    { id: 'pavilion', name: 'Pavilion Stand', price: 1599, description: 'Premium seating with excellent view of the pitch.' },
    { id: 'vip', name: 'VIP Stand', price: 1999, description: 'Exclusive seating with premium amenities.' },
    { id: 'corporate', name: 'Corporate Box', price: 2599, description: 'Private box for corporate groups with catering.' },
    { id: 'hospitality', name: 'Hospitality Box', price: 2999, description: 'Luxury experience with food and beverages included.' },
    { id: 'skybox', name: 'Skybox/Lounge', price: 3999, description: 'Ultimate luxury experience with panoramic views.' },
  ];

  const handleTicketTypeSelect = (id: string) => {
    if (selectionSource === 'buttons' && id !== selectedTicketType) {
      setSelectionSource('grid');
      setSelectedTicketType(id);
    } else if (selectionSource !== 'buttons') {
      setSelectionSource('grid');
      setSelectedTicketType(id);
    }
  };

  const handleBottomTicketSelect = (id: string) => {
    if (selectionSource === 'grid' && id !== selectedTicketType) {
      setSelectionSource('buttons');
      setSelectedTicketType(id);
    } else if (selectionSource !== 'grid') {
      setSelectionSource('buttons');
      setSelectedTicketType(id === selectedTicketType ? null : id);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const selectedTicket = selectionSource === 'grid' 
    ? ticketTypes.find(ticket => ticket.id === selectedTicketType)
    : bottomTicketTypes.find(ticket => ticket.id === selectedTicketType);
    
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;
  
  const selectedBottomTicket = bottomTicketTypes.find(ticket => ticket.id === selectedTicketType);

  const handleProceedToBooking = () => {
    if (selectedTicket) {
      const bookingData = {
        match: {
          team1: matchData.team1.name,
          team2: matchData.team2.name,
          date: matchData.date,
          time: matchData.time,
          venue: matchData.venue
        },
        ticketType: selectedTicket.name,
        price: selectedTicket.price,
        quantity: quantity
      };
      
      navigate('/booking-confirmation', { state: { bookingData } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="px-4 py-3 flex items-center border-b">
          <Link to="/" className="mr-4">
            <ArrowLeft className="w-5 h-5 text-[#333333]" />
          </Link>
          <h1 className="text-lg font-semibold">Select Your Seats</h1>
        </div>
      </header>

      {/* Main Content - Increased top padding */}
      <main className="pt-20 pb-24">
        {/* Match Info Card */}
        <div className="bg-white p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 mb-2">
                <img 
                  src={matchData.team1.logo}
                  alt={matchData.team1.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/64?text=Team1";
                  }}
                />
              </div>
              <span className="text-xs text-center font-medium">{matchData.team1.name}</span>
            </div>

            <div className="text-sm font-bold px-2">VS</div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 mb-2">
                <img 
                  src={matchData.team2.logo}
                  alt={matchData.team2.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/64?text=Team2";
                  }}
                />
              </div>
              <span className="text-xs text-center font-medium">{matchData.team2.name}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <Calendar className="text-[#eb4e62] w-4 h-4 flex-shrink-0" />
              <span>{matchData.date}, {matchData.time}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="text-[#eb4e62] w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-2">{matchData.venue}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white mb-4 shadow-sm">
          <div className="flex">
            <button 
              className={`flex-1 py-3 text-center transition-colors ${
                activeTab === 'map' 
                  ? 'border-b-2 border-[#eb4e62] text-[#eb4e62] font-medium' 
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('map')}
            >
              Stadium Map
            </button>
            <button 
              className={`flex-1 py-3 text-center transition-colors ${
                activeTab === 'tickets' 
                  ? 'border-b-2 border-[#eb4e62] text-[#eb4e62] font-medium' 
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('tickets')}
            >
              Ticket Types
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'map' ? (
          <div className="bg-white p-4 mb-4 shadow-sm">
            <h2 className="text-base font-semibold mb-1">Select a section from the stadium map</h2>
            <p className="text-xs text-gray-600 mb-4">Click on a section to select your preferred seating area</p>
            
            <div className="text-center mb-4">
              <h3 className="text-sm font-medium mb-2">{matchData.team1.name} vs {matchData.team2.name}</h3>
              <p className="text-xs text-gray-600">Venue: {matchData.venue}</p>
            </div>
            
            {/* Stadium Map */}
            <div className="relative w-full aspect-square mb-6 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={stadiumMaps[matchData.venue as keyof typeof stadiumMaps] || "/api/placeholder/400/400"}
                alt={`${matchData.venue} Map`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/api/placeholder/400/400";
                }}
              />
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00BCD4]"></div>
                <span className="text-xs">JIO Pavilion</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#9C27B0]"></div>
                <span className="text-xs">Premium Blocks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF9800]"></div>
                <span className="text-xs">Club House</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 mb-4 shadow-sm">
            <h2 className="text-base font-semibold mb-1">Select a ticket type</h2>
            <p className="text-xs text-gray-600 mb-4">Choose from our available ticket categories</p>
            
            {/* Ticket Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {ticketTypes.map(ticket => (
                <div 
                  key={ticket.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedTicketType === ticket.id && selectionSource === 'grid' 
                      ? 'border-[#eb4e62] bg-red-50 ring-1 ring-[#eb4e62]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTicketTypeSelect(ticket.id)}
                >
                  <div className="text-[#eb4e62] font-bold text-sm mb-1">₹{ticket.price}</div>
                  <div className="text-xs font-medium mb-1">{ticket.name}</div>
                  <div className="text-xs text-gray-500">{ticket.available} seats</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Summary */}
        <div className="bg-white p-4 mb-4 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Booking Summary</h2>
          
          <div className="mb-4">
            <p className="text-sm font-medium mb-3">Ticket Type:</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {bottomTicketTypes.map(ticket => (
                <button 
                  key={ticket.id}
                  className={`py-3 px-2 text-center text-sm rounded-lg border transition-all ${
                    selectedTicketType === ticket.id && selectionSource === 'buttons' 
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleBottomTicketSelect(ticket.id)}
                >
                  <span className="font-medium block">{ticket.name}</span>
                  <span className="text-xs text-gray-600">₹{ticket.price}</span>
                </button>
              ))}
            </div>
          </div>
          
          {selectedTicketType && (
            <div className="border-t pt-4">
              {selectedBottomTicket && selectionSource === 'buttons' && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm">
                  <p className="font-medium mb-1">{selectedBottomTicket.name}</p>
                  <p className="text-gray-600 text-xs">{selectedBottomTicket.description}</p>
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Price per Ticket:</p>
                <p className="font-bold text-xl">₹{selectedTicket?.price}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Quantity:</p>
                <div className="flex items-center">
                  <button 
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    onClick={decrementQuantity}
                  >
                    <Minus size={16} />
                  </button>
                  <div className="w-14 h-10 flex items-center justify-center border-t border-b border-gray-300 font-medium">
                    {quantity}
                  </div>
                  <button 
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    onClick={incrementQuantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6 py-3 border-t border-b">
                <p className="font-bold text-lg">Total:</p>
                <p className="font-bold text-[#eb4e62] text-2xl">₹{totalPrice}</p>
              </div>
              
              <button 
                className={`w-full py-4 rounded-lg text-white font-medium text-lg transition-all ${
                  selectedTicketType 
                    ? 'bg-[#eb4e62] hover:bg-[#d43b4f] active:scale-95' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!selectedTicketType}
                onClick={handleProceedToBooking}
              >
                Proceed to Booking
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SeatSelection;
