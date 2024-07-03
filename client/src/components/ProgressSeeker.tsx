interface Props {
  className?: string;
  isDimmed?: boolean;
  progress: number;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ProgressSeeker = ({
  className,
  isDimmed,
  progress,
  handleSeek,
}: Props) => {
  return (
    <div
      className={`${className} ${
        isDimmed && "opacity-25"
      } w-full ml-2 mr-1 flex-1 h-2 bg-white rounded hover:bg-slate-200`}
      onClick={(e) => {
        if (!isDimmed) {
          handleSeek(e);
        }
      }}
    >
      <div
        className="h-full bg-green-500 rounded"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressSeeker;
