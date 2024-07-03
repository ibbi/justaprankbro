import { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image,
} from "@nextui-org/react";

import ProgressSeeker from "./ProgressSeeker";

import { Script } from "../api";

interface Props {
  script: Script;
  isPlaying: boolean;
  selectScript: () => void;
  onPlaySample: () => void;
  onPauseSample: () => void;
}

const ScriptCard = ({
  script,
  isPlaying,
  selectScript,
  onPlaySample,
  onPauseSample,
}: Props) => {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      onPauseSample();
    } else {
      onPlaySample();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    audioRef.current.currentTime =
      (offsetX / rect.width) * audioRef.current.duration;
  };

  return (
    <div className="flex gap-4">
      <Card isFooterBlurred className="relative flex flex-col h-32 sm:h-auto">
        <CardHeader
          className="bg-gradient-to-b from-black/75 to-transparent cursor-pointer hover:underline"
          onClick={selectScript}
        >
          <h4 className="text-white font-medium text-2xl">{script.title}</h4>
        </CardHeader>
        <Image
          className="z-0 scale-150 cursor-pointer"
          src={script.image}
          alt={script.title}
          onClick={togglePlay}
        />
        <div className="absolute bottom-0 w-full">
          <CardBody
            className="bg-gradient-to-t from-black/75 to-transparent cursor-pointer"
            onClick={togglePlay}
          >
            <ProgressSeeker
              progress={progress}
              isPlaying={isPlaying}
              handleSeek={handleSeek}
            />
          </CardBody>
          <CardFooter className="hidden sm:block bg-white/20 w-full border-t-1 border-zinc-100/50 items-center">
            <Button
              className="w-full"
              color="default"
              variant="solid"
              onClick={selectScript}
            >
              Select prank
            </Button>
          </CardFooter>
        </div>

        <audio
          ref={audioRef}
          src={script.sample_audio}
          onEnded={onPauseSample}
          onTimeUpdate={() =>
            setProgress(
              ((audioRef.current?.currentTime || 0) /
                (audioRef.current?.duration || 1)) *
                100,
            )
          }
        />
      </Card>

      <div className="sm:hidden">
        <Button
          className="w-full h-32 text-xl"
          color="default"
          variant="solid"
          onClick={selectScript}
        >
          Select
          <br />
          prank
        </Button>
      </div>
    </div>
  );
};

export default ScriptCard;
