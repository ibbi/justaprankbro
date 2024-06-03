import { Button } from "@nextui-org/react";

interface AccountButtonProps {
  onSignUpClick: () => void;
}

function AccountButton({ onSignUpClick }: AccountButtonProps) {
  return (
    <div>
      <Button color="primary" onClick={onSignUpClick}>
        Sign Up
      </Button>
    </div>
  );
}

export default AccountButton;
