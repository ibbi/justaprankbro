import AccountButton from "./AccountButton";
import { User } from "../api";

interface HeroProps {
  user: User | null;
  onSignUpClick: () => void;
  onAccountClick: () => void;
  isUserFetching: boolean;
}

function Hero({
  user,
  onSignUpClick,
  onAccountClick,
  isUserFetching,
}: HeroProps) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-3xl p-4">PrankRing</p>
      <div className="p-4">
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
