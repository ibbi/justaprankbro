import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
} from "@nextui-org/react";

const API_URL = import.meta.env.VITE_API_URL;

interface SocketModalProps {
  isOpen: boolean;
}

const SocketModal: React.FC<SocketModalProps> = ({ isOpen }) => {
  const [statusWs, setStatusws] = useState<WebSocket>();
  const [streamWs, setStreamWs] = useState<WebSocket>();

  const statusConnect = () => {
    let socket: WebSocket | null = null;

    const connectWebSocket = async () => {
      socket = new WebSocket(
        `ws://${API_URL.replace(/.*\/\//, "")}/status/3764`
      );
      socket.onopen = () => {
        console.log("status connected");
      };

      socket.onmessage = () => {};

      socket.onclose = () => {
        console.log("status disconnected");
      };

      setStatusws(socket);
    };

    connectWebSocket();
  };
  const statusDc = () => {
    if (statusWs) {
      statusWs.close();
    }
  };
  const streamConnect = () => {
    let socket: WebSocket | null = null;

    const connectWebSocket = async () => {
      socket = new WebSocket(`ws://${API_URL.replace(/.*\/\//, "")}/stream`);
      socket.onopen = () => {
        console.log("stream connected");
      };

      socket.onmessage = () => {};

      socket.onclose = () => {
        console.log("stream disconnected");
      };

      setStreamWs(socket);
    };

    connectWebSocket();
  };
  const streamDc = () => {
    if (streamWs) {
      streamWs.close();
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>shesh</ModalHeader>
        <ModalFooter>
          <Button color="danger" onPress={statusConnect}>
            status connect
          </Button>
          <Button color="danger" onPress={statusDc}>
            status dc
          </Button>
          <Button color="danger" onPress={streamConnect}>
            stream connect
          </Button>
          <Button color="danger" onPress={streamDc}>
            stream dc
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SocketModal;
