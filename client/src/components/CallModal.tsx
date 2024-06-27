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
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const setupAudio = useCallback(async () => {
    audioContextRef.current = new AudioContext();
    await audioContextRef.current.audioWorklet.addModule("/audio-processor.js");
    audioWorkletNodeRef.current = new AudioWorkletNode(
      audioContextRef.current,
      "audio-processor"
    );
    audioWorkletNodeRef.current.connect(audioContextRef.current.destination);
  }, []);

  const cleanupAudio = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioWorkletNodeRef.current = null;
  }, []);

  const connectWebSocket = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      console.error("No authentication token available");
      return;
    }

    wsRef.current = new WebSocket(
      `wss://${API_URL.replace(/.*\/\//, "")}/stream/client/${callSid}`
    );

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      wsRef.current?.send(token);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.status);
      if (data.recording_url) {
        setAudioUrl(data.recording_url);
      }
      if (data.based_chunk) {
        const chunk = new Uint8Array(
          atob(data.based_chunk)
            .split("")
            .map((char) => char.charCodeAt(0))
        );
        audioWorkletNodeRef.current?.port.postMessage({ chunk });
      }
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };
  }, [callSid]);

  useEffect(() => {
    if (isOpen) {
      setStatus("Initializing...");
      setAudioUrl(null);
      setupAudio().then(() => {
        if (callSid) {
          connectWebSocket();
        }
      });
    } else {
      cleanupAudio();
      if (wsRef.current) {
        wsRef.current.close();
      }
    }

    return () => {
      cleanupAudio();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, callSid, setupAudio, cleanupAudio, connectWebSocket]);

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
