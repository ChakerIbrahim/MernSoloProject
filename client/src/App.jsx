import { useEffect } from "react";
import socket from "./socket";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Browse from "./pages/Browse";
import PackageDetail from "./pages/PackageDetail";
import { Route, Routes } from "react-router-dom";
import InquiryChat from "./pages/InquiryChat";
import TravelerDashboard from "./pages/TravelerDashboard";
import AgencyDashboard from "./pages/AgencyDashboard";
import AgencyProfile from "./pages/AgencyProfile";

function App() {
   useEffect(() => {
    if (socket.connected) {
      console.log("already connected to socket server:", socket.id);
    }

    socket.on("connect", () => {
      console.log("connected to socket server:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("socket connection error:", err.message);
    });
    socket.off("connect");
    socket.off("connect_error");
    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/packages/:id" element={<PackageDetail />} />
      <Route path="/inquiries/:id" element={<InquiryChat />} />
      <Route path="/dashboard/traveler" element={<TravelerDashboard />} />
      <Route path="/dashboard/agency" element={<AgencyDashboard />} />
      <Route path="/agencies/:id" element={<AgencyProfile />} />
    </Routes>
  );
}

export default App;