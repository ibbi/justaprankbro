import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { Script, User } from "../api";
import { PhoneInput } from "../components/PhoneInput";
import WrapperWithHeader from "./WrapperWithHeader";

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
  onClickPay: () => void;
}
const ScriptModal: React.FC<ScriptModalProps> = ({
  user,
  script,
  onClose,
  onSubmit,
  onSignUp,
  onClickPay,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dynamicVars, setDynamicVars] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDynamicVars((prevVars) => ({ ...prevVars, [name]: value }));
  };

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
  };

  const handleSubmit = () => {
    onSubmit(phoneNumber, script!.id, dynamicVars);
    onClose();
  };

  const isInvalidPurchase = () => !user || user.balance < (script?.cost || 1);

  if (!script) return null;

  return (
    <Modal isOpen={!!script} onOpenChange={onClose} className="dark">
      <WrapperWithHeader title={script.title}>
        <ModalBody>
          <PhoneInput value={phoneNumber} onChange={handlePhoneChange} />
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

        <Button
          color="primary"
          onPress={handleSubmit}
          isDisabled={isInvalidPurchase()}
        >
          Submit
        </Button>
        {isInvalidPurchase() && (
          <ModalFooter>
            {!user ? (
              <p>
                Want a free call?{" "}
                <span
                  className="text-primary underline cursor-pointer"
                  onClick={onSignUp}
                >
                  Sign up!
                </span>
              </p>
            ) : (
              <p>
                You're broke!{" "}
                <span
                  className="text-primary underline cursor-pointer"
                  onClick={onClickPay}
                >
                  Buy some credits!
                </span>
              </p>
            )}
          </ModalFooter>
        )}
      </WrapperWithHeader>
    </Modal>
  );
};

export default ScriptModal;
