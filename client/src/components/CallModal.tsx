import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

import { getToken } from "../api";

const API_URL = import.meta.env.VITE_API_URL;

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callSid: string | null;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, callSid }) => {
  const [status, setStatus] = useState<string>("Initializing...");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [, setWs] = useState<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Reset state when modal is opened
    if (isOpen) {
      setStatus("Initializing...");
      setAudioUrl(null);
      audioContextRef.current = new window.AudioContext();
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    let socket: WebSocket | null = null;

    const connectWebSocket = async () => {
      if (callSid && isOpen) {
        const token = await getToken();
        if (!token) {
          console.error("No authentication token available");
          return;
        }

        socket = new WebSocket(
          `wss://${API_URL.replace(/.*\/\//, "")}/stream/client/${callSid}`
        );
        socket.onopen = () => {
          console.log("WebSocket connected");
          socket?.send(token);
        };

        socket.onmessage = (event) => {
          if (typeof event.data === "string") {
            const data = JSON.parse(event.data);
            setStatus(data.status);
            if (data.recording_url) {
              setAudioUrl(data.recording_url);
            }
          } else if (event.data instanceof Blob) {
            playAudioChunk(event.data);
          }
        };

        socket.onclose = () => {
          console.log("WebSocket disconnected");
        };

        setWs(socket);
      }
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [callSid, isOpen]);

  const playAudioChunk = async (chunk: Blob) => {
    if (!audioContextRef.current) return;

    const arrayBuffer = await chunk.arrayBuffer();
    const audioBuffer = await audioContextRef.current.decodeAudioData(
      arrayBuffer
    );

    sourceNodeRef.current = audioContextRef.current.createBufferSource();
    sourceNodeRef.current.buffer = audioBuffer;
    sourceNodeRef.current.connect(audioContextRef.current.destination);
    sourceNodeRef.current.start();
  };

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
