import React from "react";
import { Modal, ModalBody, Button } from "@nextui-org/react";
import { CoinIcon, GoogleIcon } from "../assets/Icons";
import WrapperWithHeader from "./WrapperWithHeader";

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
    <Modal isOpen={isOpen} onOpenChange={onClose} className="dark">
      <WrapperWithHeader
        title={
          <>
            Get{" "}
            <span className="inline-block align-baseline ml-2">
              <CoinIcon />
            </span>{" "}
            <span className="text-warning">1 free credit</span> when you sign
            up!
          </>
        }
      >
        <ModalBody>
          <Button onPress={onGoogleAuth} startContent={<GoogleIcon />}>
            Continue with Google
          </Button>
        </ModalBody>
      </WrapperWithHeader>
    </Modal>
  );
};

export default AuthModal;
