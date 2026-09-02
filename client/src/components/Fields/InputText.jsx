import TextField from "@mui/material/TextField";
import { useState } from "react";

// A thin wrapper around MUI's TextField that only shows a red error state
// once the user has actually interacted with the field — so a brand-new,
// untouched form doesn't show every field as "wrong" before you've typed anything
function InputText(props) {
  const { id, isError, isDirty = false, ...rest } = props;
  const [isTouched, setIsTouched] = useState(isDirty);

  return (
    <TextField
      variant="filled"
      color="primary"
      onInput={(e) => {
        if (rest.onChange) {
          rest.onChange(e);
        }
        setIsTouched(true);
      }}
      error={isTouched && isError}
      id={id}
      {...rest}
    />
  );
}

export default InputText;