import AccountButton from "./AccountButton";
import { User } from "firebase/auth";

interface HeroProps {
  user: User | null;
  onSignUpClick: () => void;
  onAccountClick: () => void;
}

function Hero({ user, onSignUpClick, onAccountClick }: HeroProps) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-3xl p-4">PrankRing</p>
      <div className="p-4">
        <AccountButton
          user={user}
          onSignUpClick={onSignUpClick}
          onAccountClick={onAccountClick}
        />
      </div>
    </div>
  );
}

export default Hero;
