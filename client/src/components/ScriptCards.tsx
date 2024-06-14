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
    <div className="flex flex-col justify-center items-center w-100">
      <div className="gap-8 grid grid-cols-1 sm:grid-cols-4 p-4 max-w-5xl">
        {scripts.map((script, index) => (
          <Card
            shadow="sm"
            key={index}
            isPressable
            onPress={() => onScriptClick(script)}
            radius="none"
            className="p-0"
            isHoverable
          >
            <CardBody className="overflow-visible p-0">
              <Image
                shadow="sm"
                radius="none"
                width="100%"
                alt={script.title}
                className="w-full object-cover h-[140px]"
                src={script.image}
              />
            </CardBody>
            <CardFooter className="text-lg justify-center">
              <h3>{script.title}</h3>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScriptCards;
