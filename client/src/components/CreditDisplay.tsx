import { Button } from "@nextui-org/react";
import { User } from "../api";
import { CoinIcon } from "../assets/Icons";

interface CreditDisplayProps {
  user: User;
  handleClick: () => void;
}

function CreditDisplay({ user, handleClick }: CreditDisplayProps) {
  return (
    <Button
      onClick={handleClick}
      variant="light"
      color="warning"
      startContent={<CoinIcon />}
    >
      {user.balance}
    </Button>
  );
}

export default CreditDisplay;
