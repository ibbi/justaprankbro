// CreditSelection.tsx
import React from "react";
import { RadioGroup, RadioProps, Button, Radio, cn } from "@nextui-org/react";
import { CoinIcon } from "../assets/Icons";

interface CustomRadioProps extends Omit<RadioProps, "children"> {
  children: React.ReactNode;
}

const CustomRadio: React.FC<CustomRadioProps> = ({
  children,
  ...otherProps
}) => {
  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 hover:bg-content2",
          "flex-row max-w-[300px] cursor-pointer rounded-lg p-4 border-2 border-transparent",
          "data-[selected=true]:border-white"
        ),
      }}
      description={
        otherProps.value == "5"
          ? "$4.99"
          : otherProps.value == "10"
          ? "$7.99"
          : "$12.99"
      }
    >
      <div className="flex gap-2">
        <CoinIcon />
        {children}
      </div>
    </Radio>
  );
};

interface CreditSelectionProps {
  selectedCredits: string;
  onSelectCredits: (credits: string) => void;
  onCheckout: () => void;
}

const CreditSelector: React.FC<CreditSelectionProps> = ({
  selectedCredits,
  onSelectCredits,
  onCheckout,
}) => {
  return (
    <div className="flex flex-col gap-12">
      <RadioGroup
        label="How many credits do you want?"
        value={selectedCredits}
        onValueChange={onSelectCredits}
        color="warning"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <CustomRadio value="5">5 Credits</CustomRadio>
          <CustomRadio value="10">10 Credits</CustomRadio>
          <CustomRadio value="20">20 Credits</CustomRadio>
        </div>
      </RadioGroup>
      <Button color="warning" className="my-8" onPress={onCheckout}>
        <p className="text-white">Buy {selectedCredits} credits</p>
      </Button>
    </div>
  );
};

export default CreditSelector;
