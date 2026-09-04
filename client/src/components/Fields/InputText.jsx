import { useState } from "react";

// A thin wrapper around a plain <input> that only shows a red error state
// once the user has actually interacted with the field — so a brand-new,
// untouched form doesn't show every field as "wrong" before you've typed anything
function InputText({ id, label, isError, isDirty = false, onChange, ...rest }) {
  const [isTouched, setIsTouched] = useState(isDirty);
  const showError = isTouched && isError;

  const handleInput = (e) => {
    if (onChange) onChange(e);
    setIsTouched(true);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        onChange={handleInput}
        className={`w-full rounded-md border bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-ocean ${
          showError ? "border-red-500" : "border-line"
        }`}
        {...rest}
      />
    </div>
  );
}

export default InputText;