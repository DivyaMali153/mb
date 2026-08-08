import Button from "@mui/material/Button";

interface Props {
  title: string;
  onClick?: () => void;
}

const PrimaryButton = ({ title, onClick }: Props) => {
  return (
    <Button variant="contained" fullWidth size="large" onClick={onClick}>
      {title}
    </Button>
  );
};

export default PrimaryButton;
