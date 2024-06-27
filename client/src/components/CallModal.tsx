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
    if (isOpen) {
      setStatus("Initializing...");
      setAudioUrl(null);
      audioContextRef.current = new window.AudioContext();
    } else {
      audioContextRef.current?.close();
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
          const data = JSON.parse(event.data);
          setStatus(data.status);
          if (data.recording_url) {
            setAudioUrl(data.recording_url);
          }
          if (data.based_chunk) {
            playAudioChunk(data.based_chunk);
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

  const playAudioChunk = async (base64Chunk: string) => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;

    // Decode base64
    const binaryString = atob(base64Chunk);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert mu-law to PCM
    const pcmSamples = muLawToPCM(bytes);

    // Create AudioBuffer
    const audioBuffer = audioContext.createBuffer(1, pcmSamples.length, 8000);
    audioBuffer.getChannelData(0).set(pcmSamples);

    // Play the audio
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();

    // Store the source node for potential later use
    sourceNodeRef.current = source;
  };

  // Mu-law to PCM conversion function
  const muLawToPCM = (muLawSamples: Uint8Array): Float32Array => {
    const pcmSamples = new Float32Array(muLawSamples.length);
    for (let i = 0; i < muLawSamples.length; i++) {
      const muLaw = muLawSamples[i];
      const sign = muLaw < 128 ? 1 : -1;
      const exponent = (muLaw & 0x70) >>> 4;
      const mantissa = muLaw & 0x0f;
      let magnitude = ((mantissa << 3) + 0x84) << exponent;
      magnitude = (magnitude - 0x84) >>> 3;
      pcmSamples[i] = (sign * magnitude) / 32768;
    }
    return pcmSamples;
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
