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
    // NEW: lets Login/Register each pass their own exact button wording,
    // instead of both saying the generic, less helpful "Submit"
    submitLabel = "Submit",
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
      className="flex flex-col gap-4"
    >
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      {isLogin ? null : (
        <InputText
          id="firstName"
          name="firstName"
          onChange={(e) => setFirstName(e.target.value)}
          label="First name"
          value={firstName}
          isError={firstName.length < 2}
        />
      )}

      {isLogin ? null : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRole("traveler")}
            className={`flex-1 rounded-md px-4 py-2.5 font-semibold ${
              role === "traveler"
                ? "bg-ocean-dark text-white"
                : "border border-line bg-white text-ink hover:border-ocean"
            }`}
          >
            I'm a traveler
          </button>
          <button
            type="button"
            onClick={() => setRole("agency")}
            className={`flex-1 rounded-md px-4 py-2.5 font-semibold ${
              role === "agency"
                ? "bg-ocean-dark text-white"
                : "border border-line bg-white text-ink hover:border-ocean"
            }`}
          >
            I'm an agency
          </button>
        </div>
      )}

      {!isLogin && role === "agency" ? (
        <>
          <InputText
            id="agencyName"
            name="agencyName"
            onChange={(e) => setAgencyName(e.target.value)}
            label="Agency name"
            value={agencyName}
            isError={agencyName.length < 2}
          />
          <InputText
            id="agencyDescription"
            name="agencyDescription"
            onChange={(e) => setAgencyDescription(e.target.value)}
            label="Agency description"
            value={agencyDescription}
            isError={agencyDescription.length < 2}
          />
        </>
      ) : null}

      <InputText
        id="email"
        name="email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        label="Email"
        value={email}
        isError={email.length < 2 || error}
      />

      <InputText
        id="password"
        name="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
        value={password}
        isError={password.length < 2 || error}
      />

      {isLogin ? null : (
        <InputText
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          label="Confirm password"
          value={confirmPassword}
          isError={confirmPassword.length < 2 || error}
        />
      )}

      <button
        type="submit"
        className="mt-2 rounded-md bg-ocean-dark px-5 py-2.5 font-semibold text-white hover:bg-ocean"
      >
        {submitLabel}
      </button>
    </form>
  );
}

export default UserForm;