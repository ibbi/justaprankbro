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
      <ModalContent>
        <ModalHeader>Account Information</ModalHeader>
        <ModalBody>
          {user && (
            <div>
              <p>Email: {user.email}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onPress={onSignOut}>
            Sign Out
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccountModal;
