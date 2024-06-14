import AccountButton from "./AccountButton";
import CreditDisplay from "./CreditDisplay";
import { User } from "../api";

interface HeroProps {
  user: User | null;
  onSignUpClick: () => void;
  onAccountClick: () => void;
  isUserFetching: boolean;
  onPaymentClick: () => void;
}

function Hero({
  user,
  onSignUpClick,
  onAccountClick,
  isUserFetching,
  onPaymentClick,
}: HeroProps) {
  return (
    <div className="flex flex-col justify-between items-center p-4 bg-gray-900">
      <div className="flex flex-row self-end">
        {user && <CreditDisplay user={user} handleClick={onPaymentClick} />}
        <AccountButton
          user={user}
          onSignUpClick={onSignUpClick}
          onAccountClick={onAccountClick}
          isLoading={isUserFetching}
        />
      </div>
      <h1 className="text-7xl p-4 py-12">PrankRing</h1>
    </div>
  );
}

export default Hero;
