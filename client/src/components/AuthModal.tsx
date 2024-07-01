import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

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
      <ModalContent>
        <ModalHeader>{"Continue with Google"}</ModalHeader>
        <ModalBody>
          <Button color="secondary" onPress={onGoogleAuth}>
            {"Continue with Google"}
          </Button>
        </ModalBody>
        <ModalFooter>You will get a free prank call!</ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
