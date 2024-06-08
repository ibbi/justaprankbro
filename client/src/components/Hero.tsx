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
    <div className="flex justify-between items-center">
      <p className="text-3xl p-4">PrankRing</p>
      <div className="p-4">
        {user && <CreditDisplay user={user} handleClick={onPaymentClick} />}
        <AccountButton
          user={user}
          onSignUpClick={onSignUpClick}
          onAccountClick={onAccountClick}
          isLoading={isUserFetching}
        />
      </div>
    </div>
  );
}

export default Hero;
