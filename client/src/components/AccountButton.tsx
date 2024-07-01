import { Button } from "@nextui-org/react";
import { User } from "../api";
import { UserIcon } from "../assets/Icons";

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
      color={user ? "default" : "primary"}
      variant={user ? "light" : "solid"}
      onClick={user ? onAccountClick : onSignUpClick}
      isLoading={isLoading}
      startContent={user ? <UserIcon /> : ""}
    >
      {user ? "Account" : "Sign Up"}
    </Button>
  );
}

export default AccountButton;
