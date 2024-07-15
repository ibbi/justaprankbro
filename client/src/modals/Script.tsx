import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@nextui-org/react";
import { PhoneNumberUtil } from "google-libphonenumber";

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
    dynamicVars: Record<string, string>,
  ) => void;
  onSignUp: () => void;
  onClickPay: () => void;
}

const phoneUtil = PhoneNumberUtil.getInstance();

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
  const [isPhoneInvalid, setIsPhoneInvalid] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setDynamicVars((prevVars) => ({ ...prevVars, [name]: value }));
  };

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
    setIsPhoneInvalid(false); // Reset invalid state when the user changes the input
  };

  const isMobile = () => window.innerWidth <= 768;

  const isPhoneValid = (phone: string) => {
    try {
      return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = () => {
    if (isPhoneValid(phoneNumber)) {
      onSubmit(phoneNumber, script!.id, dynamicVars);
      onClose();
    } else {
      setIsPhoneInvalid(true);
    }
  };

  const isInvalidPurchase = () => !user || user.balance < (script?.cost || 1);

  return (
    <Modal
      isOpen={!!script}
      onOpenChange={onClose}
      className="dark"
      size={isMobile() ? "full" : "xl"}
    >
      {!script ? null : (
        <WrapperWithHeader title={script.title}>
          <ModalBody>
            <PhoneInput
              value={phoneNumber}
              onChange={handlePhoneChange}
              isInvalid={isPhoneInvalid}
            />
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
                          size="lg"
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
                          size="lg"
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
              className="mt-4"
            >
              <p className="text-white">
                {`Make the prank call! (${script.cost} credit${
                  script.cost === 1 ? "" : "s"
                })`}
              </p>
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
      )}
    </Modal>
  );
};

export default ScriptModal;
