import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { Script, User } from "../api";

interface ScriptModalProps {
  user: User | null;
  script: Script | null;
  onClose: () => void;
  onSubmit: (
    phoneNumber: string,
    scriptId: number,
    dynamicVars: Record<string, string>
  ) => void;
  onSignUp: () => void;
}

const ScriptModal: React.FC<ScriptModalProps> = ({
  user,
  script,
  onClose,
  onSubmit,
  onSignUp,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dynamicVars, setDynamicVars] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      setPhoneNumber(value);
    } else {
      setDynamicVars((prevVars) => ({ ...prevVars, [name]: value }));
    }
  };

  const handleSubmit = () => {
    onSubmit(phoneNumber, script!.id, dynamicVars);
    onClose();
  };

  if (!script) return null;

  return (
    <Modal isOpen={!!script} onOpenChange={onClose} className="dark">
      <ModalContent>
        <ModalHeader>{script.title}</ModalHeader>
        <ModalBody>
          <Input
            label="Phone Number"
            name="phoneNumber"
            value={phoneNumber}
            onChange={handleInputChange}
          />
          {script.fields.map((field) => (
            <Input
              key={field.variable_name}
              label={field.form_label}
              name={field.variable_name}
              value={dynamicVars[field.variable_name] || ""}
              onChange={handleInputChange}
            />
          ))}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="flat" onPress={onClose}>
            Close
          </Button>
          <Button color="primary" onPress={handleSubmit} isDisabled={!user}>
            Submit
          </Button>
          {!user && (
            <Button color="secondary" onPress={onSignUp}>
              Sign Up
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScriptModal;
