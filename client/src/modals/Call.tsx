import React, { useEffect, useState, useRef } from "react";
import { Modal, ModalBody, Spinner, Button } from "@nextui-org/react";
import { createTimeModel, useTimeModel } from "react-compound-timer";

import { getToken, retryCall } from "../api.js";
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
import { startRinger, stopRinger, resetRinger } from "../ringer";

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

const callTimer = createTimeModel({
  initialTime: 0,
  direction: "forward",
  timeToUpdate: 1000,
  startImmediately: false,
});

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callSid: string | null;
  onRetry: (newCallSid: string) => void;
}

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  callSid,
  onRetry,
}) => {
  const [status, setStatus] = useState<CallStatus>(CallStatus.INITIATED);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inboundPlayerRef = useRef<PCMPlayer | null>(null);
  const outboundPlayerRef = useRef<PCMPlayer | null>(null);
  const { value, start, stop, reset } = useTimeModel(callTimer);

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
      resetRinger();
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
          `wss://${API_URL.replace(/.*\/\//, "")}/stream/client/${callSid}`,
        );
        socket.onopen = () => {
          console.log("WebSocket connected");
          socket?.send(token);
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.status) {
            setStatus(data.status);
            if (data.status === CallStatus.RINGING) {
              startRinger();
            } else {
              stopRinger();
              resetRinger();
            }
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
      stopRinger();
    };
  }, [callSid, isOpen]);

  useEffect(() => {
    reset();
    start();
  }, [status, start, stop, reset]);

  const handleRetry = async () => {
    try {
      const result = await retryCall();
      if (result && result.call_sid) {
        if (ws) {
          ws.close();
        }

        setStatus(CallStatus.INITIATED);
        setAudioUrl(null);

        onRetry(result.call_sid);
      }
    } catch (error) {
      console.error("Failed to retry call:", error);
    }
  };

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
            {status === CallStatus.IN_PROGRESS && (
              <p className="font-bold p-4">
                {value.m.toString().padStart(2, "0")}:
                {value.s.toString().padStart(2, "0")}
              </p>
            )}
            {[
              CallStatus.NO_ANSWER,
              CallStatus.BUSY,
              CallStatus.FAILED,
            ].includes(status) && (
              <Button
                color="secondary"
                onPress={handleRetry}
              >{`Retry call (free)`}</Button>
            )}
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
