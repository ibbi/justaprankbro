import AccountButton from "./AccountButton";
import CreditDisplay from "./CreditDisplay";
import { User } from "../api";
import { Button } from "@nextui-org/react";
import { HistoryIcon } from "../assets/Icons";

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
    <div className="flex flex-col justify-between items-center p-4 ">
      <div className="flex flex-row self-end space-x-2">
        {user && (
          <>
            <CreditDisplay user={user} handleClick={onPaymentClick} />
            <Button
              onPress={onHistoryClick}
              variant="light"
              startContent={<HistoryIcon />}
            >
              Call History
            </Button>
          </>
        )}
        <AccountButton
          user={user}
          onSignUpClick={onSignUpClick}
          onAccountClick={onAccountClick}
          isLoading={isUserFetching}
        />
      </div>
      <h1 className="text-5xl sm:text-7xl p-4 rock">PrankRing</h1>
      <h3 className="text-xl sm:text-2xl p-4 sm:py-12">
        Choose a prank call scenario and our prankbot will take care of the
        rest!
      </h3>
    </div>
  );
}

export default Hero;
