import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";

import Header from "./components/site/Header";
import Footer from "./components/site/Footer";
import EnquiryModal from "./components/site/EnquiryModal";

import Home from "./pages/Home";
import BikesListing from "./pages/BikesListing";
import BikeDetail from "./pages/BikeDetail";
import ServicesPage from "./pages/ServicesPage";
import ServiceBookingPage from "./pages/ServiceBookingPage";
import InsurancePage from "./pages/InsurancePage";
import EmiCalculator from "./pages/EmiCalculator";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const [enquiry, setEnquiry] = useState({ open: false, type: "product_enquiry", title: "", vehicle: null });

  const openEnquiry = useCallback((opts = {}) => {
    setEnquiry({ open: true, type: opts.type || "product_enquiry", title: opts.title || "", vehicle: opts.vehicle || null });
  }, []);
  const closeEnquiry = useCallback(() => setEnquiry(e => ({ ...e, open: false })), []);

  return (
    <div className="App min-h-screen flex flex-col">
      <BrowserRouter>
        <Header onOpenEnquiry={openEnquiry} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home onOpenEnquiry={openEnquiry} />} />
            <Route path="/bikes" element={<BikesListing onOpenEnquiry={openEnquiry} />} />
            <Route path="/bikes/:slug" element={<BikeDetail onOpenEnquiry={openEnquiry} />} />
            <Route path="/services" element={<ServicesPage onOpenEnquiry={openEnquiry} />} />
            <Route path="/service-booking" element={<ServiceBookingPage />} />
            <Route path="/insurance" element={<InsurancePage />} />
            <Route path="/emi-calculator" element={<EmiCalculator onOpenEnquiry={openEnquiry} />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
        <EnquiryModal open={enquiry.open} onClose={closeEnquiry} type={enquiry.type} title={enquiry.title} vehicle={enquiry.vehicle} />
      </BrowserRouter>
    </div>
  );
}

export default App;
