import React, { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { Modal, ModalBody, Button } from "@nextui-org/react";
import { createCheckoutSession } from "../api";
import CreditSelector from "../components/CreditSelector";
import WrapperWithHeader from "./WrapperWithHeader";

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
      className="dark"
      size={showCheckout ? "full" : "2xl"}
      scrollBehavior="inside"
    >
      <WrapperWithHeader title="Buy prank credits">
        <ModalBody>
          {showCheckout ? (
            <>
              <Button onClick={handleBack}>Back</Button>

              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </>
          ) : (
            <CreditSelector
              selectedCredits={selectedCredits}
              onSelectCredits={setSelectedCredits}
              onCheckout={handleCheckout}
            />
          )}
        </ModalBody>
      </WrapperWithHeader>
    </Modal>
  );
};

export default PaymentModal;
