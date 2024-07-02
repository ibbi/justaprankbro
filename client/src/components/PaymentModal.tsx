// PaymentModal.tsx
import React, { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from "@nextui-org/react";
import { createCheckoutSession } from "../api";
import CreditSelector from "./CreditSelector";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

interface PaymentModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  const [selectedCredits, setSelectedCredits] = useState("5");
  const [showCheckout, setShowCheckout] = useState(false);

  const fetchClientSecret = useCallback(() => {
    return createCheckoutSession(selectedCredits).then(
      (data) => data.clientSecret
    );
  }, [selectedCredits]);

  const options = {
    fetchClientSecret,
    onComplete: () => {
      onSuccess();
      setShowCheckout(false);
      onClose();
    },
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleBack = () => {
    setShowCheckout(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        setShowCheckout(false);
        onClose();
      }}
      className="dark px-4 pb-6"
      size={showCheckout ? "full" : "2xl"}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader
          className={showCheckout ? "justify-start" : "justify-center"}
        >
          {showCheckout ? (
            <Button onClick={handleBack}>Back</Button>
          ) : (
            <p className="text-3xl py-8">Buy prank credits</p>
          )}
        </ModalHeader>
        <ModalBody>
          {showCheckout ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <CreditSelector
              selectedCredits={selectedCredits}
              onSelectCredits={setSelectedCredits}
              onCheckout={handleCheckout}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PaymentModal;
