import React from "react";

interface FormInputProps {
  id: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  name: string;
  required?: boolean;
  autoComplete?: string;
}

export default function FormInput({
  id,
  label,
  type = "text",
  name,
  required = false,
  autoComplete,
}: FormInputProps) {
  return (
    <div className="_social_login_form_input _mar_b14">
      <label className="_social_login_label _mar_b8" htmlFor={id}>
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        className="form-control _social_login_input"
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}