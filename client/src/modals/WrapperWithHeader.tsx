import React from "react";
import { ModalContent, ModalHeader } from "@nextui-org/react";

interface WrapperWithHeaderProps {
  children: React.ReactNode;
  title: React.ReactNode | string;
}

const WrapperWithHeader: React.FC<WrapperWithHeaderProps> = ({
  children,
  title,
}) => {
  return (
    <ModalContent className="px-4 pb-6">
      <ModalHeader className="justify-center">
        <p className="text-3xl py-8 text-center">{title}</p>
      </ModalHeader>
      {children}
    </ModalContent>
  );
};

export default WrapperWithHeader;
