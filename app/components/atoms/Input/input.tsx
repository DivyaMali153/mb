import TextField from "@mui/material/TextField";

interface Props {
  label: string;
  type?: string;
}

const Input = ({ label, type = "text" }: Props) => {
  return <TextField fullWidth margin="normal" label={label} type={type} />;
};

export default Input;
