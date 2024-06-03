import { useEffect, useState } from "react";
import Hero from "./components/Hero";
import { Divider } from "@nextui-org/divider";
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import { getScripts, Script } from "./api";
import "./App.css";

function App() {
  const [scripts, setScripts] = useState<Script[]>([]);

  useEffect(() => {
    const fetchScripts = async () => {
      const data = await getScripts();
      setScripts(Object.values(data));
    };

    fetchScripts();
  }, []);

  return (
    <div className="dark text-foreground bg-background h-screen">
      <Hero />
      <Divider />
      <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
        {scripts.map((script, index) => (
          <Card
            shadow="sm"
            key={index}
            isPressable
            onPress={() => console.log("Script pressed:", script.title)}
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
    </div>
  );
}

export default App;
