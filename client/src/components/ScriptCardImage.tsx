import React from "react";
import { Image } from "@nextui-org/react";

interface ScriptCardImageProps {
  title: string;
  image: string;
  audioLink: string;
  onClick: () => void;
}

export const ScriptCardImage: React.FC<ScriptCardImageProps> = ({
  title,
  image,
  audioLink,
  onClick,
}) => {
  return (
    <div className="relative" onClick={onClick}>
      <Image
        shadow="sm"
        radius="none"
        alt={title}
        src={image}
        className="w-full z-0"
      />
      <div className="absolute bottom-2 right-2">
        <audio controls src={audioLink} />
      </div>
    </div>
  );
};
