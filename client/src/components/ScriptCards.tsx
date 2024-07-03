import ScriptCard from "./ScriptCard";

import { Script } from "../api";

interface Props {
  scripts: Script[];
  onScriptClick: (script: Script) => void;
}

const ScriptCards = ({ scripts, onScriptClick }: Props) => {
  return (
    <div className="flex flex-col items-center w-100">
      <div className="gap-8 grid grid-cols-1 sm:grid-cols-4 p-4 max-w-7xl">
        {scripts.map((script, i) => (
          <ScriptCard
            key={i}
            script={script}
            selectScript={() => onScriptClick(script)}
          />
        ))}
      </div>
    </div>
  );
};

export default ScriptCards;
