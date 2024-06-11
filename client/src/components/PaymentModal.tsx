import React, { useCallback } from "react";
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
  const fetchClientSecret = useCallback(() => {
    return createCheckoutSession().then((data) => data.clientSecret);
  }, []);

  const options = {
    fetchClientSecret,
    onComplete: () => {
      onSuccess();
      onClose();
    },
  };
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} className="dark" size="3xl">
      <ModalContent>
        <ModalHeader>Buy Credits</ModalHeader>
        <ModalBody>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
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
