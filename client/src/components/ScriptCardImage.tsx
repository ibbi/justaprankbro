import React, { useState, useRef } from "react";
import { Image } from "@nextui-org/react";

interface ScriptCardImageProps {
  title: string;
  image: string;
  audioLink: string;
}

export const ScriptCardImage: React.FC<ScriptCardImageProps> = ({
  title,
  image,
  audioLink,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative" onClick={togglePlay}>
      <Image
        shadow="sm"
        radius="none"
        alt={title}
        src={image}
        className="w-full z-0"
      />
      <div className="absolute bottom-2 left-2 flex items-center">
        <button
          className="bg-black bg-opacity-50 rounded-full p-2 text-white"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 5.25v13.5m-7.5-13.5v13.5"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
          )}
        </button>
        {isPlaying && (
          <div className="ml-2 w-24 h-1 bg-white bg-opacity-50 rounded">
            <div
              className="h-full bg-white rounded"
              style={{
                width: `${
                  ((audioRef.current?.currentTime || 0) /
                    (audioRef.current?.duration || 1)) *
                  100
                }%`,
              }}
            ></div>
          </div>
        )}
      </div>
      <audio
        ref={audioRef}
        src={audioLink}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          // Force re-render to update seeker
          setIsPlaying(true);
        }}
      />
    </div>
  );
};
