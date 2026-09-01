import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Browse from "./pages/Browse";
import PackageDetail from "./pages/PackageDetail";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/packages/:id" element={<PackageDetail />} />
    </Routes>
  );
}

export default App;