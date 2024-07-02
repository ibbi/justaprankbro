import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { User } from "../api";
import { SignOutIcon } from "../assets/Icons";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignOut: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignOut,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} className="dark px-4 pb-6">
      <ModalContent>
        <ModalHeader className={"justify-center"}>
          <p className="text-3xl py-8 text-center">My Account</p>
        </ModalHeader>
        <ModalBody>
          {user && (
            <p className="mb-8">
              <span className="font-bold">My email:</span> {user.email}
            </p>
          )}
          <Button
            color="danger"
            onPress={onSignOut}
            startContent={<SignOutIcon />}
          >
            Sign Out
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AccountModal;
