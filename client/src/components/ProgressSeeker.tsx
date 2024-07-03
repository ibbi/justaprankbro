interface Props {
  progress: number;
  isPlaying: boolean;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ProgressSeeker = ({ progress, isPlaying, handleSeek }: Props) => {
  return (
    <div className="flex gap-2 justify-start items-center">
      <div className="bg-black bg-opacity-60 rounded-full w-16 h-16 flex items-center justify-center">
        <p className="text-4xl">{isPlaying ? "⏸" : "▶"}</p>
      </div>

      {isPlaying && (
        <div
          className="ml-2 mr-1 flex-1 h-5 sm:h-2 bg-white rounded hover:bg-slate-200"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-green-500 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ProgressSeeker;
