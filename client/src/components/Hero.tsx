import AccountButton from "./AccountButton";

interface HeroProps {
  onSignUpClick: () => void;
}

function Hero({ onSignUpClick }: HeroProps) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-3xl p-4">PrankRing</p>
      <div className="p-4">
        <AccountButton onSignUpClick={onSignUpClick} />
      </div>
    </div>
  );
}

export default Hero;
