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
import { Script } from "../api";

interface ScriptModalProps {
  script: Script | null;
  onClose: () => void;
  onSubmit: (
    phoneNumber: string,
    scriptId: number,
    dynamicVars: Record<string, string>
  ) => void;
}

const ScriptModal: React.FC<ScriptModalProps> = ({
  script,
  onClose,
  onSubmit,
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
          <Button color="primary" onPress={handleSubmit}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScriptModal;
