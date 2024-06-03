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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSignUp: (email: string, password: string) => void;
  onUserSignIn: (email: string, password: string) => void;
  onGoogleSignUp: () => void;
  onGoogleSignIn: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserSignUp,
  onUserSignIn,
  onGoogleSignUp,
  onGoogleSignIn,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);

  const handleEmailPasswordAuth = () => {
    if (isSignUp) {
      onUserSignUp(email, password);
    } else {
      onUserSignIn(email, password);
    }
    onClose();
  };

  const handleGoogleAuth = () => {
    if (isSignUp) {
      onGoogleSignUp();
    } else {
      onGoogleSignIn();
    }
    onClose();
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} className="dark">
      <ModalContent>
        <ModalHeader>{isSignUp ? "Sign Up" : "Sign In"}</ModalHeader>
        <ModalBody>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={handleEmailPasswordAuth}>
            {isSignUp ? "Sign Up with Email" : "Sign In with Email"}
          </Button>
          <Button color="secondary" onPress={handleGoogleAuth}>
            {isSignUp ? "Sign Up with Google" : "Sign In with Google"}
          </Button>
          <p onClick={toggleAuthMode}>
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need to create an account? Sign up"}
          </p>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
