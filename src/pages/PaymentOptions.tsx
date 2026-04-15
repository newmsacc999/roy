import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

interface PaymentData {
  bookingData: {
    match: {
      team1: string;
      team2: string;
    };
    ticketType: string;
    quantity: number;
  };
  totalAmount: number;
}

// Add these logo URLs at the top of your component
const paymentLogos = {
  phonePe:
    "https://eu-images.contentstack.com/v3/assets/blt7dacf616844cf077/blt85b08b4917701bc0/67997d68d8a86f00203713cc/phonepe-logo-icon.jpg?width=1280&auto=webp&quality=95&format=jpg&disable=upscale",
  paytm:
    "https://yt3.googleusercontent.com/nfovxGynnTWHMBFQfUjZzbFrViXNa9MYLZXuRFXhWGAfwWwIBsqV_4B5A_LGu0sZlMenuimmsQ=s900-c-k-c0x00ffffff-no-rj",
  googlePay:
    "https://miro.medium.com/v2/resize:fit:1400/1*NNI7aPLtSaLo6jb4KGEFDA.jpeg",
};

// Add UPI IDs configuration
const upiConfig = {
  phonePe: "m249479a13@mairtel",
  paytm: "m249479a13@mairtel",
  googlePay: "m249479a13@mairtel",
};

function generatePhonePeData(upi: string, amount: number) {
  var jsonData = {
    contact: {
      cbsName: "",
      nickName: "",
      vpa: "m249479a13@mairtel",
      type: "VPA",
    },
    p2pPaymentCheckoutParams: {
      note: "",
      isByDefaultKnownContact: true,
      enableSpeechToText: false,
      allowAmountEdit: false,
      showQrCodeOption: false,
      disableViewHistory: true,
      shouldShowUnsavedContactBanner: false,
      isRecurring: false,
      checkoutType: "DEFAULT",
      transactionContext: "p2p",
      initialAmount: Math.round(amount * 100), // ₹ → paise
      disableNotesEdit: true,
      showKeyboard: true,
      currency: "INR",
      shouldShowMaskedNumber: true,
    },
  };

  return btoa(JSON.stringify(jsonData));
}

function getPhonePeRedirectURL(upi: string, amount: number) {
  var encodedData = generatePhonePeData(upi, amount);
  return "phonepe://native?data=" + encodedData + "&id=p2ppayment";
}

function PaymentOptions() {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<string>("upi");

  // Get payment data from location state or use default values
  const paymentData: PaymentData = location.state?.paymentData || {
    bookingData: {
      match: {
        team1: "Gujarat Titans",
        team2: "Rajasthan Royals",
      },
      ticketType: "Premium Stand",
      quantity: 1,
    },
    totalAmount: 311,
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  // Add handler for UPI app clicks
  const handleUpiClick = (app: "phonePe" | "paytm" | "googlePay") => {
    if (app === "googlePay") {
      alert(
        "Google Pay servers are currently down. Please try another payment method.",
      );
      return;
    }

    const amount = paymentData.totalAmount;
    const upiId = upiConfig[app];
    const description = `Tickets for ${paymentData.bookingData.match.team1} vs ${paymentData.bookingData.match.team2}`;

    // Create app-specific deep links with proper parameters
    let appLink = "";

    if (app === "phonePe") {
      // PhonePe specific format
      appLink = getPhonePeRedirectURL(upiId, amount);
      // appLink = `phonepe://pay?pa=${upiId}&pn=BookMyShow&am=${amount}&tn=${encodeURIComponent(description)}&cu=INR`;
    } else if (app === "paytm") {
      // Paytm specific format
      appLink = `paytmmp://cash_wallet?pa=${upiId}&pn=Shop&am=${amount}&tr=&mc=8999&cu=INR&tn=Order:asdfsdfdfde766c" +
        "&sign=AAuN7izDWN5cb8A5scnUiNME+LkZqI2DWgkXlN1McoP6WZABa/KkFTiLvuPRP6/nWK8BPg/rPhb+u4QMrUEX10UsANTDbJaALcSM9b8Wk218X+55T/zOzb7xoiB+BcX8yYuYayELImXJHIgL/c7nkAnHrwUCmbM97nRbCVVRvU0ku3Tr" +
        "&featuretype=money_transfer`;
    }

    // Fallback if app not installed
    window.location.href = appLink;

    // Optional: Add fallback timeout
    setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.location.href = `upi://pay?pa=${upiId}&pn=BookMyShow&am=${amount}&tn=${encodeURIComponent(description)}&cu=INR`;
      }
    }, 2000);
  };

  // const handleOtherUpiClick = () => {
  //   const amount = paymentData.totalAmount;
  //   const upiId = upiConfig.phonePe; // Using default UPI ID for other apps
  //   const description = `Tickets for ${paymentData.bookingData.match.team1} vs ${paymentData.bookingData.match.team2}`;

  //   // Create UPI payment link for other UPI apps
  //   const upiLink = `upi://pay?pa=${upiId}&pn=BookMyShow&tn=${encodeURIComponent(description)}&am=${amount}&cu=INR`;
  //   window.location.href = upiLink;
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="px-4 py-3 flex items-center border-b">
          <Link to="/booking-confirmation" className="mr-4">
            <ArrowLeft className="w-5 h-5 text-[#333333]" />
          </Link>
          <div className="flex-1">
            <img
              src="https://getlogo.net/wp-content/uploads/2020/04/bookmyshow-logo-vector.png"
              alt="BookMyShow"
              className="h-6"
            />
          </div>
        </div>
      </header>

      {/* Main Content - Increased top padding for better header spacing */}
      <main className="pt-20 pb-6 px-4">
        <h1 className="text-lg font-bold mb-4">Payment Options</h1>

        <div className="mb-4">
          <div className="text-sm text-gray-600">All Payment Options</div>
        </div>

        {/* Amount Summary Card - Added for better UX */}
        <div className="bg-white rounded-md shadow-sm mb-4 p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold text-lg text-[#eb4e62]">
              ₹{paymentData.totalAmount}
            </span>
          </div>
        </div>

        {/* UPI/QR Section */}
        <div className="bg-white rounded-md shadow-sm mb-4 overflow-hidden">
          <div
            className="p-4 flex justify-between items-center cursor-pointer active:bg-gray-50"
            onClick={() => toggleSection("upi")}
          >
            <h2 className="font-medium">UPI/QR</h2>
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${expandedSection === "upi" ? "transform rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {expandedSection === "upi" && (
            <div className="p-4 pt-0 border-t animate-slideDown">
              <div className="bg-blue-50 text-blue-600 text-sm p-3 rounded mb-4">
                Upto ₹200 cashback on your first UPI payment
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div
                  className="border rounded-md p-3 flex flex-col items-center cursor-pointer hover:border-blue-500 active:bg-gray-50 transition-colors"
                  onClick={() => handleUpiClick("phonePe")}
                >
                  <img
                    src={paymentLogos.phonePe}
                    alt="PhonePe"
                    className="w-10 h-10 mb-1 object-contain rounded-full"
                  />
                  <span className="text-xs font-medium">PhonePe</span>
                </div>
                <div
                  className="border rounded-md p-3 flex flex-col items-center cursor-pointer hover:border-blue-500 active:bg-gray-50 transition-colors"
                  onClick={() => handleUpiClick("paytm")}
                >
                  <img
                    src={paymentLogos.paytm}
                    alt="Paytm"
                    className="w-10 h-10 mb-1 object-contain rounded-full"
                  />
                  <span className="text-xs font-medium">Paytm</span>
                </div>
                <div
                  className="border rounded-md p-3 flex flex-col items-center cursor-pointer hover:border-blue-500 active:bg-gray-50 transition-colors opacity-50"
                  onClick={() => handleUpiClick("googlePay")}
                >
                  <img
                    src={paymentLogos.googlePay}
                    alt="Google Pay"
                    className="w-10 h-10 mb-1 object-contain rounded-full"
                  />
                  <span className="text-xs font-medium">Google Pay</span>
                  <span className="text-[10px] text-red-500 mt-1">Down</span>
                </div>
              </div>

              {/* <div className="mt-3">
                <button
                  className="border rounded-md p-3 w-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  onClick={handleOtherUpiClick}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white mr-2">
                    <span className="text-sm font-bold">UPI</span>
                  </div>
                  <span className="text-sm font-medium">Other UPI Apps</span>
                </button>
              </div> */}
            </div>
          )}
        </div>

        {/* Cards Section */}
        <div className="bg-white rounded-md shadow-sm mb-4 overflow-hidden">
          <div
            className="p-4 flex justify-between items-center cursor-pointer active:bg-gray-50"
            onClick={() => toggleSection("cards")}
          >
            <h2 className="font-medium">Cards</h2>
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${expandedSection === "cards" ? "transform rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {expandedSection === "cards" && (
            <div className="p-4 pt-0 border-t">
              <div className="flex items-center text-yellow-600 bg-yellow-50 p-3 rounded">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Card payment is temporarily unavailable
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Section */}
        <div className="bg-white rounded-md shadow-sm mb-4 overflow-hidden">
          <div
            className="p-4 flex justify-between items-center cursor-pointer active:bg-gray-50"
            onClick={() => toggleSection("wallet")}
          >
            <h2 className="font-medium">Wallet</h2>
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${expandedSection === "wallet" ? "transform rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {expandedSection === "wallet" && (
            <div className="p-4 pt-0 border-t">
              <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">Wallet payment not available</span>
              </div>
            </div>
          )}
        </div>

        {/* Important Information */}
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 mb-4">
          <h2 className="text-red-500 font-medium mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Important Information
          </h2>

          <ul className="text-sm space-y-3">
            <li className="flex">
              <span className="text-red-500 mr-2">•</span>
              <span className="text-gray-700">
                Your e-ticket will be sent to your registered email immediately
                after successful payment.
              </span>
            </li>
            <li className="flex">
              <span className="text-red-500 mr-2">•</span>
              <span className="text-gray-700">
                For IPL matches, you can use the e-ticket on your phone for
                direct stadium entry - no need to print!
              </span>
            </li>
            <li className="flex">
              <span className="text-red-500 mr-2">•</span>
              <span className="text-gray-700">
                Alternatively, you can print the ticket or show a screenshot at
                the venue.
              </span>
            </li>
            <li className="flex">
              <span className="text-red-500 mr-2">•</span>
              <span className="text-gray-700">
                Tickets are <strong>non-refundable</strong> once purchased.
              </span>
            </li>
            <li className="flex">
              <span className="text-red-500 mr-2">•</span>
              <span className="text-gray-700">
                Please arrive at least 60 minutes before the match starts to
                avoid last-minute rush.
              </span>
            </li>
            <li className="flex">
              <span className="text-red-500 mr-2">•</span>
              <span className="text-gray-700">
                Carry a <strong>valid photo ID</strong> matching the ticket
                details for verification.
              </span>
            </li>
          </ul>

          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-xs text-blue-600">
              For any issues, contact our 24/7 support at{" "}
              <strong>help@bookmyshow.com</strong>
            </p>
          </div>

          <div className="text-center text-xs text-gray-500 mt-4 border-t pt-3">
            By proceeding, you agree to our Terms & Conditions
          </div>
        </div>
      </main>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default PaymentOptions;
