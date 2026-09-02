import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Typography } from "@mui/material";
import Header from "../components/Header";
import UserForm from "../components/UserForm";

function Login() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e, data) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/login", data, {
        withCredentials: true,
      });
      setError("");
      // No dashboard exists yet — Browse is a reasonable place to land for now
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
          Log in
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          New here? <Link to="/register">Create an account</Link>
        </Typography>
        <UserForm
          handleSubmit={handleSubmit}
          error={error}
          isLogin={true}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
      </Container>
    </>
  );
}

export default Login;