import { Button } from "@nextui-org/react";
import { User } from "firebase/auth";

interface AccountButtonProps {
  user: User | null;
  onSignUpClick: () => void;
  onAccountClick: () => void;
}

function AccountButton({
  user,
  onSignUpClick,
  onAccountClick,
}: AccountButtonProps) {
  return (
    <div>
      {user ? (
        <Button color="primary" onClick={onAccountClick}>
          Account
        </Button>
      ) : (
        <Button color="primary" onClick={onSignUpClick}>
          Sign Up
        </Button>
      )}
    </div>
  );
}

export default AccountButton;
