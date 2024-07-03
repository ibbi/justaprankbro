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
import PlayButton from "./PlayButton";

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-start items-center gap-4">
        <Card
          isFooterBlurred
          className="relative flex flex-col w-24 h-24 sm:w-auto sm:h-auto"
        >
          <CardHeader
            className="hidden sm:block bg-gradient-to-b from-black/75 to-transparent cursor-pointer hover:underline"
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
          <div className="absolute sm:bottom-0 w-full">
            <CardBody
              className="sm:bg-gradient-to-t from-black/75 to-transparent cursor-pointer"
              onClick={togglePlay}
            >
              <div className="flex gap-2 justify-center sm:justify-start items-center">
                <PlayButton isPlaying={isPlaying} />

                {isPlaying && (
                  <ProgressSeeker
                    className="hidden sm:block"
                    progress={progress}
                    handleSeek={handleSeek}
                  />
                )}
              </div>
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
        </Card>

        <div
          className="sm:hidden pr-3 flex flex-col flex-1"
          onClick={selectScript}
        >
          <h4 className="text-white font-medium text-xl text-start pb-4">
            {script.title}
          </h4>

          <div>
            <ProgressSeeker
              isDimmed={!isPlaying}
              progress={progress}
              handleSeek={handleSeek}
            />
          </div>
        </div>
      </div>

      {isPlaying && (
        <div className="sm:hidden">
          <Button className="w-full" onClick={selectScript}>
            Select prank
          </Button>
        </div>
      )}

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
    </div>
  );
};

export default ScriptCard;
