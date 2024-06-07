import { User } from "../api";

interface CreditDisplayProps {
  user: User;
}

function CreditDisplay({ user }: CreditDisplayProps) {
  const handleClick = () => {
    // TODO: Redirect to Stripe checkout page
    console.log("Redirecting to Stripe checkout page");
  };

  return (
    <div className="mr-4 cursor-pointer" onClick={handleClick}>
      <span className="text-lg">Credits: {user.balance}</span>
    </div>
  );
}

export default CreditDisplay;
