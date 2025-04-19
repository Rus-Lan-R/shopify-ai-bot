import { TextField, TextFieldProps } from "@shopify/polaris";
import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface IFormInput extends Omit<TextFieldProps, "onChange"> {
  name: string;
}

export const FormInput: FC<IFormInput> = (props) => {
  const { name, ...rest } = props;

  const control = useFormContext();

  return (
    <Controller
      name={name}
      control={control?.control}
      render={({
        field: { ref: _, ...fieldWithoutRef },
        fieldState: { error },
      }) => <TextField {...fieldWithoutRef} {...rest} error={error?.message} />}
    />
  );
};
