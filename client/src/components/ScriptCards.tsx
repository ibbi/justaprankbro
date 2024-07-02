import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import { Script } from "../api";
import { ScriptCardImage } from "./ScriptCardImage";

interface ScriptCardsProps {
  scripts: Script[];
  onScriptClick: (script: Script) => void;
}

const ScriptCards: React.FC<ScriptCardsProps> = ({
  scripts,
  onScriptClick,
}) => {
  return (
    <div className="flex flex-col items-center w-100">
      <div className="gap-8 grid grid-cols-1 sm:grid-cols-4 p-4 max-w-7xl">
        {scripts.map((script, index) => (
          <Card
            shadow="sm"
            key={index}
            isPressable
            onPress={() => onScriptClick(script)}
            isHoverable
          >
            <CardHeader className="text-lg justify-center">
              <h3>{script.title}</h3>
            </CardHeader>
            <CardBody className="relative overflow-visible p-0">
              <ScriptCardImage
                title={script.title}
                image={script.image}
                onClick={() => console.log("hi")}
                audioLink={script.sample_audio}
              />
            </CardBody>
            <CardFooter>
              <Button
                startContent={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                Hear sample
              </Button>
              <Button
                startContent={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-4.72 4.72a.75.75 0 1 1-1.06-1.06l4.72-4.72h-2.69a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                Make call
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScriptCards;
