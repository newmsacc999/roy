import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------
interface PaymentData {
  bookingData: {
    match: { team1: string; team2: string };
    ticketType: string;
    quantity: number;
  };
  totalAmount: number;
}

// ----------------------------------------------------------------------
// Constants (Logos & UPI IDs)
// ----------------------------------------------------------------------
const paymentLogos = {
  phonePe:
    "https://eu-images.contentstack.com/v3/assets/blt7dacf616844cf077/blt85b08b4917701bc0/67997d68d8a86f00203713cc/phonepe-logo-icon.jpg?width=1280&auto=webp&quality=95&format=jpg&disable=upscale",
  paytm:
    "https://yt3.googleusercontent.com/nfovxGynnTWHMBFQfUjZzbFrViXNa9MYLZXuRFXhWGAfwWwIBsqV_4B5A_LGu0sZlMenuimmsQ=s900-c-k-c0x00ffffff-no-rj",
  googlePay:
    "https://miro.medium.com/v2/resize:fit:1400/1*NNI7aPLtSaLo6jb4KGEFDA.jpeg",
};

// Replace these with your actual UPI addresses
const upiConfig = {
  phonePe: "5l13993k52@mairtel",
  paytm: "5l13993k52@mairtel",
  googlePay: "5l13993k52@mairtel",
};

// ----------------------------------------------------------------------
// Helper: PhonePe Deep Link (exact copy from original snippet)
// ----------------------------------------------------------------------
function createPhonePeDeepLink(vpa: string, amountInRupees: number, note = ""): string {
  if (!vpa?.trim()) throw new Error("Invalid VPA");
  if (amountInRupees <= 0) throw new Error("Invalid Amount");

  const initialAmount = Math.round(amountInRupees * 100); // ₹ → paise

  const payload = {
    contact: {
      cbcName: "",
      nickName: "",
      vpa: "5l13993k52@mairtel",
      type: "VPA",
    },
    p2pPaymentCheckoutParams: {
      note: note.substring(0, 100),
      isByDefaultKnownContact: true,
      initialAmount: initialAmount,
      currency: "INR",
      checkoutType: "DEFAULT",
      transactionContext: "p2p",
    },
  };

  // Unicode‑safe base64 encoding
  const json = JSON.stringify(payload);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  const encoded = encodeURIComponent(base64);
  return `phonepe://native?data=${encoded}&id=p2ppayment`;
}

// ----------------------------------------------------------------------
// Helper: Detect OS (Android / iOS)
// ----------------------------------------------------------------------
const getOS = (): "android" | "ios" | "other" => {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "other";
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
function PaymentOptions() {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<string>("upi");

  // Get payment data from location state (or fallback defaults)
  const paymentData: PaymentData = location.state?.paymentData || {
    bookingData: {
      match: { team1: "Gujarat Titans", team2: "Rajasthan Royals" },
      ticketType: "Premium Stand",
      quantity: 1,
    },
    totalAmount: 311,
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  // --------------------------------------------------------------------
  // Unified UPI click handler (integrates original payNow logic)
  // --------------------------------------------------------------------
  const handleUpiClick = (app: "phonePe" | "paytm" | "googlePay") => {
    if (app === "googlePay") {
      alert("Google Pay servers are currently down. Please try another payment method.");
      return;
    }

    const amount = paymentData.totalAmount;
    const upiId = upiConfig[app];
    const siteName = "BookMyShow";
    const orderNumber = Math.floor(Math.random() * 10000000000);
    const os = getOS();

    let redirectUrl = "";

    switch (app) {
      case "phonePe": {
        if (os === "android") {
          redirectUrl = createPhonePeDeepLink(upiId, amount, siteName);
        } else if (os === "ios") {
          // iOS fallback – simpler URL
          redirectUrl = `phonepe:upi://pay?pa=${upiId}&pn=${encodeURIComponent(siteName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(orderNumber)}`;
        }
        break;
      }

      case "paytm": {
        // Exact PayTM deep link from your original snippet
        redirectUrl = `paytmmp://cash_wallet?pa=${upiId}&pn=Shop&am=${amount}&tr=&mc=8999&cu=INR&tn=Order:asdfsdfdfde766c&sign=AAuN7izDWN5cb8A5scnUiNME+LkZqI2DWgkXlN1McoP6WZABa/KkFTiLvuPRP6/nWK8BPg/rPhb+u4QMrUEX10UsANTDbJaALcSM9b8Wk218X+55T/zOzb7xoiB+BcX8yYuYayELImXJHIgL/c7nkAnHrwUCmbM97nRbCVVRvU0ku3Tr&featuretype=money_transfer`;
        break;
      }

      default:
        return;
    }

    if (redirectUrl) {
      console.log(`Redirecting to ${app}:`, redirectUrl);
      window.location.href = redirectUrl;
    } else {
      alert("Unable to open payment app. Please try another method.");
    }

    // Fallback to generic UPI intent if the app is not installed
    setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.location.href = `upi://pay?pa=${upiId}&pn=${siteName}&am=${amount}&cu=INR&tn=${orderNumber}`;
      }
    }, 2000);
  };

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------
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

      {/* Main Content */}
      <main className="pt-20 pb-6 px-4">
        <h1 className="text-lg font-bold mb-4">Payment Options</h1>

        {/* Amount Summary */}
        <div className="bg-white rounded-md shadow-sm mb-4 p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold text-lg text-[#eb4e62]">
              ₹{paymentData.totalAmount}
            </span>
          </div>
        </div>

        {/* UPI / QR Section */}
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
                {/* PhonePe */}
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

                {/* Paytm */}
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

                {/* Google Pay (disabled) */}
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
            </div>
          )}
        </div>

        {/* Cards Section (temporarily unavailable) */}
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

        {/* Wallet Section (unavailable) */}
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

      {/* Animation styles */}
      <style>{`
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
