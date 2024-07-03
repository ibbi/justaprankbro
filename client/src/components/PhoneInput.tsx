import React from "react";
import {
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
  CountryIso2,
} from "react-international-phone";
import "react-international-phone/style.css";

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  isInvalid: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  isInvalid,
}) => {
  const { inputValue, country, setCountry, inputRef, handlePhoneValueChange } =
    usePhoneInput({
      defaultCountry: "us",
      value,
      onChange: (data) => {
        onChange(data.phone);
      },
    });

  return (
    <Input
      type="tel"
      label="Your victim's phone number:"
      labelPlacement="outside"
      size="lg"
      variant="faded"
      value={inputValue}
      onChange={handlePhoneValueChange}
      isRequired
      ref={inputRef}
      isInvalid={isInvalid}
      errorMessage={isInvalid ? "Please enter a valid phone number" : ""}
      startContent={
        <Dropdown className="dark" placement="bottom-start">
          <DropdownTrigger>
            <Button isIconOnly variant="light">
              <FlagImage iso2={country.iso2} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Select country"
            className="max-h-[300px] overflow-y-auto no-scrollbar"
            selectionMode="single"
            selectedKeys={[country.iso2]}
            onSelectionChange={(keys) => {
              const selectedCountry = Array.from(keys)[0];
              if (typeof selectedCountry === "string") {
                setCountry(selectedCountry as CountryIso2);
              }
            }}
          >
            {defaultCountries.map((c) => {
              const country = parseCountry(c);
              return (
                <DropdownItem key={country.iso2} textValue={country.name}>
                  <div className="flex items-center gap-2">
                    <FlagImage iso2={country.iso2} />
                    <span>{country.name}</span>
                    <span className="text-default-500 text-small">
                      +{country.dialCode}
                    </span>
                  </div>
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </Dropdown>
      }
    />
  );
};
