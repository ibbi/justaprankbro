import { useState } from "react";

import ScriptCard from "./ScriptCard";

import { Script } from "../api";

interface Props {
  scripts: Script[];
  onScriptClick: (script: Script) => void;
}

const ScriptCards = ({ scripts, onScriptClick }: Props) => {
  const [activeSample, setActiveSample] = useState<string>();

  return (
    <div className="flex flex-col items-center w-100">
      <div className="gap-4 sm:gap-8 grid grid-cols-1 sm:grid-cols-4 p-4 max-w-7xl w-full">
        {scripts.map((script, i) => (
          <ScriptCard
            key={i}
            script={script}
            isPlaying={script.sample_audio === activeSample}
            selectScript={() => {
              onScriptClick(script);
              setActiveSample(undefined);
            }}
            onPlaySample={() => setActiveSample(script.sample_audio)}
            onPauseSample={() => setActiveSample(undefined)}
          />
        ))}
      </div>
    </div>
  );
};

export default ScriptCards;
