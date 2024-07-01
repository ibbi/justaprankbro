// import React from "react";
// import {
//   Input,
//   Dropdown,
//   DropdownTrigger,
//   DropdownMenu,
//   DropdownItem,
// } from "@nextui-org/react";
// import {
//   usePhoneInput,
//   CountryIso2,
//   defaultCountries,
//   parseCountry,
//   FlagImage,
// } from "react-international-phone";
// import "react-international-phone/style.css";

// interface PhoneInputProps {
//   value: string;
//   onChange: (phone: string) => void;
// }

// const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange }) => {
//   const { inputValue, handlePhoneValueChange, country, setCountry } =
//     usePhoneInput({
//       defaultCountry: "us",
//       value,
//       countries: defaultCountries,
//       onChange: (data) => {
//         onChange(data.phone);
//       },
//     });

//   return (
//     <Input
//       label="Phone Number"
//       value={inputValue}
//       onChange={handlePhoneValueChange}
//       startContent={
//         <Dropdown className="dark" placement="bottom-start">
//           <DropdownTrigger>
//             <div className="flex items-center cursor-pointer">
//               <FlagImage iso2={country.iso2} className="mr-2" />
//             </div>
//           </DropdownTrigger>
//           <DropdownMenu
//             aria-label="Select country"
//             selectionMode="single"
//             className="dark"
//             selectedKeys={new Set([country.iso2])}
//             onSelectionChange={(keys) =>
//               setCountry(Array.from(keys)[0] as CountryIso2)
//             }
//           >
//             {defaultCountries.map((c) => {
//               const parsedCountry = parseCountry(c);
//               return (
//                 <DropdownItem
//                   key={parsedCountry.iso2}
//                   textValue={parsedCountry.name}
//                   className="dark"
//                   startContent={
//                     <FlagImage iso2={parsedCountry.iso2} className="mr-2" />
//                   }
//                 >
//                   +{parsedCountry.dialCode} {parsedCountry.name}
//                 </DropdownItem>
//               );
//             })}
//           </DropdownMenu>
//         </Dropdown>
//       }
//     />
//   );
// };

// export default PhoneInput;

import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
}
const PhoneInputt: React.FC<PhoneInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <PhoneInput
        defaultCountry="ua"
        value={value}
        onChange={(phone) => onChange(phone)}
      />
    </div>
  );
};

export default PhoneInputt;
