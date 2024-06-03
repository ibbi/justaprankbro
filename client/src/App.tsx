import { useEffect, useState } from "react";
import Hero from "./components/Hero";
import { Divider } from "@nextui-org/divider";
import {
  getScripts,
  Script,
  makeCall,
  getCallStatus,
  signInWithEmail,
  signUpWithEmail,
  authWithGoogle,
} from "./api";
import ScriptCards from "./components/ScriptCards";
import ScriptModal from "./components/ScriptModal";
import AuthModal from "./components/AuthModal";
import { User } from "firebase/auth";

import "./App.css";

function App() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [, setCallData] = useState<any>(null);

  useEffect(() => {
    const fetchScripts = async () => {
      const data = await getScripts();
      setScripts(Object.values(data));
    };

    fetchScripts();
  }, []);

  useEffect(() => {
    console.log(user);
  }, [user]);

  const handleSubmit = async (
    phoneNumber: string,
    agentId: string,
    dynamicVars: Record<string, string>
  ) => {
    try {
      const { call_id } = await makeCall(phoneNumber, agentId, dynamicVars);
      setCallStatus("registered");

      let status = "registered";
      while (status !== "ended" && status !== "error") {
        const data = await getCallStatus(call_id);
        status = data.call_status;
        setCallData(data);
        setCallStatus(status);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error("Error making call:", error);
      setCallStatus("error");
    }
  };

  const handleScriptClick = (script: Script) => {
    setSelectedScript(script);
  };

  const handleCloseScriptModal = () => {
    setSelectedScript(null);
  };

  const handleSignUpClick = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setUser(null);
  };

  const handleUserSignUp = async (email: string, password: string) => {
    try {
      const userCredential = await signUpWithEmail(email, password);
      setUser(userCredential.user);
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  const handleUserSignIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmail(email, password);
      setUser(userCredential.user);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const userCredential = await authWithGoogle();
      setUser(userCredential.user);
    } catch (error) {
      console.error("Error signing up with Google:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await authWithGoogle();
      setUser(userCredential.user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="dark text-foreground bg-background h-screen">
      <Hero onSignUpClick={handleSignUpClick} />
      <Divider />
      <ScriptCards scripts={scripts} onScriptClick={handleScriptClick} />
      <ScriptModal
        script={selectedScript}
        onClose={handleCloseScriptModal}
        onSubmit={handleSubmit}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        onUserSignUp={handleUserSignUp}
        onUserSignIn={handleUserSignIn}
        onGoogleSignUp={handleGoogleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
      />
      <p>{callStatus}</p>
    </div>
  );
}

export default App;
