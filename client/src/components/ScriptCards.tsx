import React from "react";
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import { Script } from "../api";

interface ScriptCardsProps {
  scripts: Script[];
  onScriptClick: (script: Script) => void;
}

const ScriptCards: React.FC<ScriptCardsProps> = ({
  scripts,
  onScriptClick,
}) => {
  return (
    <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
      {scripts.map((script, index) => (
        <Card
          shadow="sm"
          key={index}
          isPressable
          onPress={() => onScriptClick(script)}
        >
          <CardBody className="overflow-visible p-0">
            <Image
              shadow="sm"
              radius="lg"
              width="100%"
              alt={script.title}
              className="w-full object-cover h-[140px]"
              src={script.image}
            />
          </CardBody>
          <CardFooter className="text-small justify-between">
            <b>{script.title}</b>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ScriptCards;
