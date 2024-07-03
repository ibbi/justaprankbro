import { PauseIcon, PlayIcon } from "../assets/Icons";

interface Props {
  isPlaying: boolean;
}

const PlayButton = ({ isPlaying }: Props) => {
  return (
    <div className="bg-black bg-opacity-60 rounded-full w-16 h-16 flex items-center justify-center">
      <p className="text-4xl">{isPlaying ? <PauseIcon /> : <PlayIcon />}</p>
    </div>
  );
};

export default PlayButton;
