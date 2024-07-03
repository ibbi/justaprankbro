import { useState, useRef } from "react";
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
  selectScript: () => void;
}

const ScriptCard = ({ script, selectScript }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying((p) => !p);
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
    <Card isFooterBlurred className="relative flex flex-col">
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
        <CardFooter className="bg-white/20 w-full border-t-1 border-zinc-100/50 items-center">
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
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={() =>
          setProgress(
            ((audioRef.current?.currentTime || 0) /
              (audioRef.current?.duration || 1)) *
              100,
          )
        }
      />
    </Card>
  );
};

export default ScriptCard;
