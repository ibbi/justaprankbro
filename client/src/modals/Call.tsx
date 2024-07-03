import React, { useEffect, useState, useRef } from "react";
import { Modal, ModalBody, Spinner } from "@nextui-org/react";
import { getToken } from "../api.js";
// @ts-expect-error whoops
import PCMPlayer from "../pcmPlayer.js";
import WrapperWithHeader from "./WrapperWithHeader.js";
import {
  FailedIcon,
  InProgressIcon,
  PendingIcon,
  RingingIcon,
  SuccessIcon,
} from "../assets/Icons.js";

const API_URL = import.meta.env.VITE_API_URL;

enum CallStatus {
  QUEUED = "queued",
  INITIATED = "initiated",
  RINGING = "ringing",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  FAILED = "failed",
  BUSY = "busy",
  NO_ANSWER = "no-answer",
}
const CallStatusData: {
  [key in CallStatus]: { title: string; icon: React.ReactNode };
} = {
  [CallStatus.QUEUED]: { title: "Queued", icon: <PendingIcon /> },
  [CallStatus.INITIATED]: { title: "Initializing...", icon: <PendingIcon /> },
  [CallStatus.RINGING]: { title: "Ringing...", icon: <RingingIcon /> },
  [CallStatus.IN_PROGRESS]: { title: "In Progress", icon: <InProgressIcon /> },
  [CallStatus.COMPLETED]: { title: "Completed :)", icon: <SuccessIcon /> },
  [CallStatus.FAILED]: { title: "Failed", icon: <FailedIcon /> },
  [CallStatus.BUSY]: { title: "Busy :(", icon: <FailedIcon /> },
  [CallStatus.NO_ANSWER]: { title: "No Answer", icon: <FailedIcon /> },
};

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callSid: string | null;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, callSid }) => {
  const [status, setStatus] = useState<CallStatus>(CallStatus.INITIATED);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [, setWs] = useState<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inboundPlayerRef = useRef<PCMPlayer | null>(null);
  const outboundPlayerRef = useRef<PCMPlayer | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus(CallStatus.INITIATED);
      setAudioUrl(null);
      audioContextRef.current = new window.AudioContext();

      // Initialize PCMPlayers
      inboundPlayerRef.current = new PCMPlayer({
        inputCodec: "Int16",
        channels: 1,
        sampleRate: 8000,
        flushTime: 3000,
        fftSize: 2048,
        audioContext: audioContextRef.current,
      });
      inboundPlayerRef.current.volume(5);

      outboundPlayerRef.current = new PCMPlayer({
        inputCodec: "Int16",
        channels: 1,
        sampleRate: 8000,
        flushTime: 3000,
        fftSize: 2048,
        audioContext: audioContextRef.current,
      });
      outboundPlayerRef.current.volume(5);
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
  const isMobile = () => window.innerWidth <= 768;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      className="dark"
      isDismissable={false}
      size={isMobile() ? "full" : "md"}
    >
      <WrapperWithHeader title={CallStatusData[status].title}>
        <ModalBody>
          <div className="flex grow items-center justify-center">
            {CallStatusData[status].icon}
          </div>
          <div className="min-h-14 flex justify-center items-end">
            {status == CallStatus.COMPLETED ? (
              audioUrl ? (
                <audio controls src={audioUrl}>
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <Spinner />
              )
            ) : null}
          </div>
        </ModalBody>
      </WrapperWithHeader>
    </Modal>
  );
};

export default CallModal;
