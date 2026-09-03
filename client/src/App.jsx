import { useEffect } from "react";
import socket from "./socket";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Browse from "./pages/Browse";
import PackageDetail from "./pages/PackageDetail";
import { Route, Routes } from "react-router-dom";
import InquiryChat from "./pages/InquiryChat";

function App() {
   useEffect(() => {
    // If the socket already connected before this effect ran — very likely
    // on localhost, since the connection can complete almost instantly —
    // the "connect" event already fired once and won't fire again. Checking
    // socket.connected directly catches that already-happened case.
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
    // Cleanup — runs if App ever unmounts, removing this listener so it
    // doesn't get duplicated if the effect ever re-ran
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
    </Routes>
  );
}

export default App;