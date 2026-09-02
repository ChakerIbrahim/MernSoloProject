import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InputText from "./Fields/InputText";

function UserForm(props) {
  const {
    firstName,
    setFirstName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    role,
    setRole,
    agencyName,
    setAgencyName,
    agencyDescription,
    setAgencyDescription,
    handleSubmit,
    error,
    isLogin = false,
  } = props;

  return (
    <form
      method="post"
      onSubmit={(e) =>
        handleSubmit(e, {
          firstName,
          email,
          password,
          confirmPassword,
          role,
          agencyName,
          agencyDescription,
        })
      }
    >
      {error ? <Typography color="error">{error}</Typography> : null}

      {isLogin ? null : (
        <Box sx={{ m: 2 }}>
          <InputText
            id="firstName"
            name="firstName"
            onChange={(e) => setFirstName(e.target.value)}
            label="First Name"
            value={firstName}
            isError={firstName.length < 2}
          />
        </Box>
      )}

      {/* Role only matters when creating a new account */}
      {isLogin ? null : (
        <Box sx={{ m: 2, display: "flex", gap: 1 }}>
          <Button
            type="button"
            variant={role === "traveler" ? "contained" : "outlined"}
            onClick={() => setRole("traveler")}
          >
            I'm a traveler
          </Button>
          <Button
            type="button"
            variant={role === "agency" ? "contained" : "outlined"}
            onClick={() => setRole("agency")}
          >
            I'm an agency
          </Button>
        </Box>
      )}

      {/* Agency-only fields, shown only once "agency" is actually selected */}
      {!isLogin && role === "agency" ? (
        <>
          <Box sx={{ m: 2 }}>
            <InputText
              id="agencyName"
              name="agencyName"
              onChange={(e) => setAgencyName(e.target.value)}
              label="Agency name"
              value={agencyName}
              isError={agencyName.length < 2}
            />
          </Box>
          <Box sx={{ m: 2 }}>
            <InputText
              id="agencyDescription"
              name="agencyDescription"
              onChange={(e) => setAgencyDescription(e.target.value)}
              label="Agency description"
              value={agencyDescription}
              isError={agencyDescription.length < 2}
            />
          </Box>
        </>
      ) : null}

      <Box sx={{ m: 2 }}>
        <InputText
          id="email"
          name="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
          value={email}
          isError={email.length < 2 || error}
        />
      </Box>

      <Box sx={{ m: 2 }}>
        <InputText
          id="password"
          name="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          label="Password"
          value={password}
          isError={password.length < 2 || error}
        />
      </Box>

      {isLogin ? null : (
        <Box sx={{ m: 2 }}>
          <InputText
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Confirm Password"
            value={confirmPassword}
            isError={confirmPassword.length < 2 || error}
          />
        </Box>
      )}

      <Button type="submit" variant="contained" color="success" sx={{ m: 2 }}>
        Submit
      </Button>
    </form>
  );
}

export default UserForm;