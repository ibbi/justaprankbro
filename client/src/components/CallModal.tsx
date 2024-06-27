import React, { useEffect, useState } from "react";
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
  const [audioChunks, setAudioChunks] = useState<Float32Array[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus("Initializing...");
      setAudioUrl(null);
      setAudioChunks([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !audioContext) {
      setAudioContext(new window.AudioContext());
    }
  }, [isOpen, audioContext]);

  function decodeMulaw(mulawData: Int8Array): Float32Array {
    const bias = 33;
    const clip = 32635;
    const decodedData = new Float32Array(mulawData.length);

    for (let i = 0; i < mulawData.length; i++) {
      let sample = mulawData[i] ^ 0xff;
      const sign = sample & 0x80 ? -1 : 1;
      sample &= 0x7f;
      sample = (sample << 3) | 0x7;
      let magnitude = (sample << 1) + 1;
      magnitude = (magnitude << (sample >> 4)) - bias;
      decodedData[i] = (sign * (magnitude > clip ? clip : magnitude)) / 32768;
    }

    return decodedData;
  }

  function playAudio() {
    if (!audioContext) return;

    const buffer = audioContext.createBuffer(1, audioChunks.length * 160, 8000);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < audioChunks.length; i++) {
      channel.set(audioChunks[i], i * 160);
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  }

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
            const chunk = atob(data.based_chunk);
            const int8Array = new Int8Array(chunk.length);
            for (let i = 0; i < chunk.length; i++) {
              int8Array[i] = chunk.charCodeAt(i);
            }
            const decodedChunk = decodeMulaw(int8Array);
            setAudioChunks((prevChunks) => [...prevChunks, decodedChunk]);
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
          <Button onPress={playAudio} disabled={audioChunks.length === 0}>
            Play Live Audio
          </Button>
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
