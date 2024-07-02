import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from "@nextui-org/react";
import { CoinIcon, GoogleIcon } from "../assets/Icons";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleAuth: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleAuth,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      className="dark pt-4 pb-8 px-4"
    >
      <ModalContent>
        <ModalHeader className={"justify-center"}>
          <p className="text-3xl py-8 text-center">
            Get{" "}
            <span className="inline-block align-baseline ml-2">
              <CoinIcon />
            </span>{" "}
            <span className="text-warning">1 free credit</span> when you sign
            up!
          </p>
        </ModalHeader>
        <ModalBody>
          <Button onPress={onGoogleAuth} startContent={<GoogleIcon />}>
            {"Continue with Google"}
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
