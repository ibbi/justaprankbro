import { Button } from "@nextui-org/react";
import { User } from "../api";

interface AccountButtonProps {
  user: User | null;
  onSignUpClick: () => void;
  onAccountClick: () => void;
  isLoading: boolean;
}

function AccountButton({
  user,
  onSignUpClick,
  onAccountClick,
  isLoading,
}: AccountButtonProps) {
  return (
    <Button
      color={user ? "secondary" : "primary"}
      onClick={user ? onAccountClick : onSignUpClick}
      isLoading={isLoading}
    >
      {user ? "Account" : "Sign Up"}
    </Button>
  );
}

export default AccountButton;
