import AccountButton from "./AccountButton";
import CreditDisplay from "./CreditDisplay";
import { User } from "../api";
import plick from "../assets/plock.wav";
import { Button } from "@nextui-org/react";

interface HeroProps {
  user: User | null;
  onSignUpClick: () => void;
  onAccountClick: () => void;
  isUserFetching: boolean;
  onPaymentClick: () => void;
  onHistoryClick: () => void;
}

function Hero({
  user,
  onSignUpClick,
  onAccountClick,
  isUserFetching,
  onPaymentClick,
  onHistoryClick,
}: HeroProps) {
  return (
    <div className="flex flex-col justify-between items-center p-4 bg-gray-900">
      <div className="flex flex-row self-end">
        {user && (
          <>
            <CreditDisplay user={user} handleClick={onPaymentClick} />
            <Button onPress={onHistoryClick}>History</Button>
          </>
        )}
        <AccountButton
          user={user}
          onSignUpClick={onSignUpClick}
          onAccountClick={onAccountClick}
          isLoading={isUserFetching}
        />
      </div>
      <h1 className="text-7xl p-4 py-12">PrankRing</h1>
      <audio controls src={plick} />
    </div>
  );
}

export default Hero;
