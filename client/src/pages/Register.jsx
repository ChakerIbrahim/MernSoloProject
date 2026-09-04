import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import UserForm from "../components/UserForm";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("traveler");
  const [agencyName, setAgencyName] = useState("");
  const [agencyDescription, setAgencyDescription] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e, data) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/register", data, {
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
      <div className="flex min-h-[75vh] items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-ink">Create an account</h1>
          <p className="mb-6 mt-1 text-sm text-ink/60">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-ocean-dark hover:underline">
              Log in
            </Link>
          </p>
          <UserForm
            handleSubmit={handleSubmit}
            error={error}
            firstName={firstName}
            setFirstName={setFirstName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            role={role}
            setRole={setRole}
            agencyName={agencyName}
            setAgencyName={setAgencyName}
            agencyDescription={agencyDescription}
            setAgencyDescription={setAgencyDescription}
            submitLabel="Create account"
          />
        </div>
      </div>
    </>
  );
}

export default Register;