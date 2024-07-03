interface Props {
  className: string;
  progress: number;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ProgressSeeker = ({ className, progress, handleSeek }: Props) => {
  return (
    <div
      className={`${className} ml-2 mr-1 flex-1 h-2 bg-white rounded hover:bg-slate-200`}
      onClick={handleSeek}
    >
      <div
        className="h-full bg-green-500 rounded"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressSeeker;
