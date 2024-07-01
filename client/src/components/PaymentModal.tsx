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
  ModalFooter,
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
    <Modal isOpen={isOpen} onOpenChange={onClose} className="dark" size="3xl">
      <ModalContent>
        <ModalHeader>
          {showCheckout && <Button onClick={handleBack}>Back</Button>}
          Buy Credits
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
        <ModalFooter>
          <Button color="danger" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentModal;
