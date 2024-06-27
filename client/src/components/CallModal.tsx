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
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const audioBufferRef = useRef<Float32Array>(new Float32Array(0));

  useEffect(() => {
    if (isOpen) {
      setStatus("Initializing...");
      setAudioUrl(null);
      audioBufferRef.current = new Float32Array(0);
    }
  }, [isOpen]);

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

  function setupAudioContext() {
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
    }

    const bufferSize = 4096;
    scriptProcessorNodeRef.current =
      audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);

    scriptProcessorNodeRef.current.onaudioprocess = (audioProcessingEvent) => {
      const outputBuffer = audioProcessingEvent.outputBuffer;
      const channelData = outputBuffer.getChannelData(0);

      if (audioBufferRef.current.length >= channelData.length) {
        channelData.set(audioBufferRef.current.subarray(0, channelData.length));
        audioBufferRef.current = audioBufferRef.current.subarray(
          channelData.length
        );
      } else {
        channelData.set(audioBufferRef.current);
        channelData.fill(0, audioBufferRef.current.length);
        audioBufferRef.current = new Float32Array(0);
      }
    };

    scriptProcessorNodeRef.current.connect(audioContextRef.current.destination);
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

        setupAudioContext();

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

            // Append the new chunk to the existing buffer
            const newBuffer = new Float32Array(
              audioBufferRef.current.length + decodedChunk.length
            );
            newBuffer.set(audioBufferRef.current);
            newBuffer.set(decodedChunk, audioBufferRef.current.length);
            audioBufferRef.current = newBuffer;

            // Start playing if this is the first chunk
            if (audioContextRef.current?.state === "suspended") {
              audioContextRef.current.resume();
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
      if (scriptProcessorNodeRef.current) {
        scriptProcessorNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
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
