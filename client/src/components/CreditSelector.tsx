// CreditSelection.tsx
import React from "react";
import { RadioGroup, RadioProps, Button, Radio, cn } from "@nextui-org/react";

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
          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary"
        ),
      }}
    >
      {children}
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
    <div className="flex flex-col gap-4">
      <RadioGroup
        label="Select Credits"
        value={selectedCredits}
        onValueChange={onSelectCredits}
      >
        <div className="flex gap-4">
          <CustomRadio value="5">5 Credits</CustomRadio>
          <CustomRadio value="10">10 Credits</CustomRadio>
          <CustomRadio value="20">20 Credits</CustomRadio>
        </div>
      </RadioGroup>
      <Button color="primary" onPress={onCheckout}>
        Checkout
      </Button>
    </div>
  );
};

export default CreditSelector;
