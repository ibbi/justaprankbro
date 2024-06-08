import { User } from "../api";

interface CreditDisplayProps {
  user: User;
  handleClick: () => void;
}

function CreditDisplay({ user, handleClick }: CreditDisplayProps) {
  return (
    <div className="mr-4 cursor-pointer" onClick={handleClick}>
      <span className="text-lg">Credits: {user.balance}</span>
    </div>
  );
}

export default CreditDisplay;
