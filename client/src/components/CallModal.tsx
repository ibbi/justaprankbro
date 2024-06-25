import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

const API_URL = import.meta.env.VITE_API_URL;

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callId: string | null;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, callId }) => {
  const [status, setStatus] = useState<string>("Initializing...");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (callId && isOpen) {
      const socket = new WebSocket(
        `wss://${API_URL.replace(/.*\/\//, "")}/ws/${callId}`
      );

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setStatus(data.status);
        if (data.audioUrl) {
          setAudioUrl(data.audioUrl);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
      };

      setWs(socket);

      return () => {
        socket.close();
      };
    }
  }, [callId, isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} className="dark">
      <ModalContent>
        <ModalHeader>Call Status</ModalHeader>
        <ModalBody>
          <p>Status: {status}</p>
          {audioUrl && (
            <audio controls src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
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

export default CallModal;
