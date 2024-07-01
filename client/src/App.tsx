import { useEffect, useState, useRef } from "react";
import Hero from "./components/Hero";
import { Divider } from "@nextui-org/divider";
import {
  getScripts,
  Script,
  makeCall,
  authWithGoogle,
  User,
  createUser,
  getUser,
  getCallHistory,
  CallHistory,
} from "./api";
import ScriptCards from "./components/ScriptCards";
import ScriptModal from "./components/ScriptModal";
import AuthModal from "./components/AuthModal";
import AccountModal from "./components/AccountModal";
import CallModal from "./components/CallModal";
import PaymentModal from "./components/PaymentModal";
import HistoryModal from "./components/HistoryModal";

import {
  User as fbUserType,
  getAdditionalUserInfo,
  onAuthStateChanged,
} from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";
import unmuteIosAudio from "unmute-ios-audio";

function App() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [, setFirebaseUser] = useState<fbUserType | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isUserFetching, setIsUserFetching] = useState(true);
  const [callSid, setCallSid] = useState<string | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const audioContextRef = useRef<AudioContext>(new window.AudioContext());

  useEffect(() => {
    const fetchScripts = async () => {
      const data = await getScripts();
      setScripts([...Object.values(data)]);
    };
    unmuteIosAudio();

    fetchScripts();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsUserFetching(true);
      setFirebaseUser(user);
      if (user) {
        try {
          const userData = await getUser();
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
          console.error("Error fetching or creating user:", error);
        }
      } else {
        setUser(null);
      }
      setIsUserFetching(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   console.log(firebaseUser);
  //   console.log(user);
  // }, [firebaseUser, user]);

  const refreshUser = async () => {
    try {
      const userData = await getUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleSubmitCall = async (
    phoneNumber: string,
    scriptId: number,
    dynamicVars: Record<string, string>
  ) => {
    try {
      const response = await makeCall(phoneNumber, scriptId, dynamicVars);
      setCallSid(response.call_sid);
      setShowCallModal(true);
    } catch (error) {
      console.error("Error making call:", error);
    }
  };

  const handleCloseAccountModal = () => {
    setShowAccountModal(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      handleCloseAccountModal();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const userCreds = await authWithGoogle();
      const isNew = await getAdditionalUserInfo(userCreds)?.isNewUser;
      if (isNew) {
        const createdUser = await createUser(userCreds.user.email || undefined);
        setUser(createdUser);
      }
    } catch (error) {
      console.error("Error signing up with Google:", error);
    }
  };

  const handleHistoryClick = async () => {
    try {
      const history = await getCallHistory();
      setCallHistory(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching call history:", error);
    }
  };

  return (
    <div className="dark text-foreground bg-background">
      <Hero
        user={user}
        onSignUpClick={() => setShowAuthModal(true)}
        onAccountClick={() => setShowAccountModal(true)}
        isUserFetching={isUserFetching}
        onPaymentClick={() => setShowPaymentModal(true)}
        onHistoryClick={handleHistoryClick}
      />
      <Divider />
      <ScriptCards
        scripts={scripts}
        onScriptClick={(s) => setSelectedScript(s)}
      />
      <ScriptModal
        user={user}
        script={selectedScript}
        onClose={() => setSelectedScript(null)}
        onSubmit={handleSubmitCall}
        onSignUp={() => setShowAuthModal(true)}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGoogleAuth={handleGoogleAuth}
      />
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        callHistory={callHistory}
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={refreshUser}
      />
      <AccountModal
        isOpen={showAccountModal}
        onClose={handleCloseAccountModal}
        user={user}
        onSignOut={handleSignOut}
      />
      <CallModal
        isOpen={showCallModal}
        onClose={() => {
          setShowCallModal(false);
          setCallSid(null);
        }}
        callSid={callSid}
        audioContextRef={audioContextRef}
      />
    </div>
  );
}

export default App;
