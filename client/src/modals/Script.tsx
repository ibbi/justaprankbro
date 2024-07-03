import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@nextui-org/react";
import { Script, User } from "../api";
import { PhoneInput } from "../components/PhoneInput";
import WrapperWithHeader from "./WrapperWithHeader";
import { PhoneIcon } from "../assets/Icons";

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
    <Modal isOpen={!!script} onOpenChange={onClose} className="dark" size="xl">
      <WrapperWithHeader title={script.title}>
        <ModalBody>
          <PhoneInput value={phoneNumber} onChange={handlePhoneChange} />
          <p className="font-bold">
            (Optional) add personal details to freak them out!
          </p>
          <div className="grid grid-cols-2 gap-4">
            {script.fields
              .sort((a, b) => {
                if (
                  a.textbox_type === "textarea" &&
                  b.textbox_type !== "textarea"
                )
                  return 1;
                if (
                  a.textbox_type !== "textarea" &&
                  b.textbox_type === "textarea"
                )
                  return -1;
                return 0;
              })
              .map((field) => {
                if (field.textbox_type === "textarea") {
                  return (
                    <div key={field.variable_name} className="col-span-2">
                      <Textarea
                        label={field.form_label}
                        name={field.variable_name}
                        value={dynamicVars[field.variable_name] || ""}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={field.variable_name} className="col-span-1">
                      <Input
                        label={field.form_label}
                        name={field.variable_name}
                        value={dynamicVars[field.variable_name] || ""}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  );
                }
              })}
          </div>

          <Button
            color="success"
            onPress={handleSubmit}
            isDisabled={isInvalidPurchase()}
            startContent={<PhoneIcon />}
          >
            <p className="text-white">Make the prank call!</p>
          </Button>
        </ModalBody>
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
