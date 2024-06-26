import React, { useEffect, useState, useRef, useCallback } from "react";
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
  const audioContext = useRef<AudioContext | null>(null);
  const audioQueue = useRef<Float32Array[]>([]);
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus("Initializing...");
      setAudioUrl(null);
      audioContext.current = new window.AudioContext();
    }
  }, [isOpen]);

  const playNextChunk = useCallback(() => {
    if (audioQueue.current.length > 0 && audioContext.current) {
      const audioChunk = audioQueue.current.shift();
      const buffer = audioContext.current.createBuffer(
        1,
        audioChunk!.length,
        8000
      );
      buffer.getChannelData(0).set(audioChunk!);

      sourceNode.current = audioContext.current.createBufferSource();
      sourceNode.current.buffer = buffer;
      sourceNode.current.connect(audioContext.current.destination);
      sourceNode.current.onended = playNextChunk;
      sourceNode.current.start();
    } else {
      sourceNode.current = null;
    }
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let audioSocket: WebSocket | null = null;

    const connectWebSockets = async () => {
      if (callSid && isOpen) {
        const token = await getToken();
        if (!token) {
          console.error("No authentication token available");
          return;
        }

        socket = new WebSocket(
          `wss://${API_URL.replace(/.*\/\//, "")}/ws/${callSid}`
        );
        socket.onopen = () => {
          console.log("Status WebSocket connected");
          socket?.send(token);
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setStatus(data.status);
          if (data.recording_url) {
            setAudioUrl(data.recording_url);
          }
        };

        socket.onclose = () => {
          console.log("Status WebSocket disconnected");
        };

        setWs(socket);

        // Set up audio WebSocket
        audioSocket = new WebSocket(
          `wss://${API_URL.replace(/.*\/\//, "")}/ws/audio/${callSid}`
        );
        audioSocket.onopen = () => {
          console.log("Audio WebSocket connected");
          audioSocket?.send(token);
        };

        audioSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.audio) {
            const audioChunk = base64ToFloat32Array(data.audio);
            audioQueue.current.push(audioChunk);
            if (!sourceNode.current) {
              playNextChunk();
            }
          }
        };

        audioSocket.onclose = () => {
          console.log("Audio WebSocket disconnected");
        };
      }
    };

    connectWebSockets();

    return () => {
      if (socket) {
        socket.close();
      }
      if (audioSocket) {
        audioSocket.close();
      }
    };
  }, [callSid, isOpen, playNextChunk]);

  const base64ToFloat32Array = (base64: string): Float32Array => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Float32Array(bytes.buffer);
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
