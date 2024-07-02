import React from "react";
import { Modal, ModalBody, Button } from "@nextui-org/react";
import { User } from "../api";
import { SignOutIcon } from "../assets/Icons";
import WrapperWithHeader from "./WrapperWithHeader";

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
    <Modal isOpen={isOpen} onOpenChange={onClose} className="dark">
      <WrapperWithHeader title="My Account">
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
      </WrapperWithHeader>
    </Modal>
  );
};

export default AccountModal;
