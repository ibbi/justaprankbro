import Hero from "./components/Hero";
import { Divider } from "@nextui-org/divider";
import { Card } from "@nextui-org/card";
import "./App.css";

function App() {
  return (
    <div className="dark text-foreground bg-background h-screen">
      <Hero />
      <Divider />
      <div>
        <Card>
          <p> hello</p>
        </Card>
      </div>
    </div>
  );
}

export default App;
