import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import UserForm from "../components/UserForm";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e, data) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/login", data, {
        withCredentials: true,
      });
      setUser(response.data.user);
      setError("");
      navigate("/browse");
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <>
      <Header />
      {/* flex + min-h-[75vh] is what actually centers this — the old MUI
          Container only ever centered horizontally, never vertically */}
      <div className="flex min-h-[75vh] items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-ink">Log in</h1>
          <p className="mb-6 mt-1 text-sm text-ink/60">
            New here?{" "}
            <Link to="/register" className="font-medium text-ocean-dark hover:underline">
              Create an account
            </Link>
          </p>
          <UserForm
            handleSubmit={handleSubmit}
            error={error}
            isLogin={true}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            submitLabel="Log in"
          />
        </div>
      </div>
    </>
  );
}

export default Login;