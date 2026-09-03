import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Typography } from "@mui/material";
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
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create an account
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </Typography>
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
        />
      </Container>
    </>
  );
}

export default Register;