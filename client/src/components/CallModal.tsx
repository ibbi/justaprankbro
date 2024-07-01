import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
// import PCMPlayer from "pcm-player";
import { getToken } from "../api";
// @ts-expect-error whoops
import PCMPlayer from "../pcmPlayer.js";
// import { unmute } from "../unmute.js";

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
  const inboundPlayerRef = useRef<PCMPlayer | null>(null);
  const outboundPlayerRef = useRef<PCMPlayer | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus("Initializing...");
      setAudioUrl(null);
      // Initialize PCMPlayers
      inboundPlayerRef.current = new PCMPlayer({
        inputCodec: "Int16",
        channels: 1,
        sampleRate: 8000,
        flushTime: 3000,
        fftSize: 2048,
      });
      inboundPlayerRef.current.volume(5);

      outboundPlayerRef.current = new PCMPlayer({
        inputCodec: "Int16",
        channels: 1,
        sampleRate: 8000,
        flushTime: 3000,
        fftSize: 2048,
      });
      outboundPlayerRef.current.volume(5);

      // unmute(inboundPlayerRef.current?.audioCtx);
      // unmute(outboundPlayerRef.current?.audioCtx);
    } else {
      // Cleanup
      if (inboundPlayerRef.current) {
        inboundPlayerRef.current.destroy();
        inboundPlayerRef.current = null;
      }
      if (outboundPlayerRef.current) {
        outboundPlayerRef.current.destroy();
        outboundPlayerRef.current = null;
      }
    }
  }, [isOpen]);

  function decodeSamples(muLawSamples64: string): Int16Array {
    const decodeTable: number[] = [0, 132, 396, 924, 1980, 4092, 8316, 16764];
    const muLawSamples: string = atob(muLawSamples64);
    const pcmSamples: Int16Array = new Int16Array(muLawSamples.length);

    for (let i = 0; i < muLawSamples.length; i++) {
      let muLawByte: number = muLawSamples.charCodeAt(i);
      muLawByte = ~muLawByte;
      const sign: number = muLawByte & 0x80;
      const exponent: number = (muLawByte >> 4) & 0x07;
      const mantissa: number = muLawByte & 0x0f;
      let sample: number = decodeTable[exponent] + (mantissa << (exponent + 3));
      if (sign != 0) sample = -sample;
      pcmSamples[i] = sample;
    }

    return pcmSamples;
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
          if (data.status) {
            setStatus(data.status);
          }
          if (data.recording_url) {
            setAudioUrl(data.recording_url);
          }
          if (data.based_chunk) {
            const pcmSamples = decodeSamples(data.based_chunk);
            if (data.type === "inbound") {
              inboundPlayerRef.current?.feed(pcmSamples.buffer);
            } else if (data.type === "outbound") {
              outboundPlayerRef.current?.feed(pcmSamples.buffer);
            }
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
