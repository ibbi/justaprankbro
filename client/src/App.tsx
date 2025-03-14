import { useEffect, useState } from "react";
import Hero from "./components/Hero";
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
import ScriptModal from "./modals/Script";
import AuthModal from "./modals/Auth";
import AccountModal from "./modals/Account";
import CallModal from "./modals/Call";
import PaymentModal from "./modals/Payment";
import HistoryModal from "./modals/History";

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

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const data = await getScripts();
        setScripts([...Object.values(data)]);
      } catch (error) {
        console.error("error fetching scripts:", error);
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      localStorage.setItem("refCode", refCode);
    }

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
    dynamicVars: Record<string, string>,
  ) => {
    try {
      const response = await makeCall(phoneNumber, scriptId, dynamicVars);
      setCallSid(response.call_sid);
      setShowCallModal(true);
      await refreshUser();
    } catch (error) {
      console.error("Error making call:", error);
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowAccountModal(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const userCreds = await authWithGoogle();
      const isNew = await getAdditionalUserInfo(userCreds)?.isNewUser;
      if (isNew) {
        const refCode = localStorage.getItem("refCode");
        const createdUser = await createUser(
          userCreds.user.email || undefined,
          refCode || undefined,
        );
        setUser(createdUser);
      }
      setShowAuthModal(false);
    } catch (error) {
      console.error("Error signing up with Google:", error);
    }
  };

  return (
    <div className="dark text-foreground bg-background flex flex-col">
      <Hero
        user={user}
        onSignUpClick={() => setShowAuthModal(true)}
        onAccountClick={() => setShowAccountModal(true)}
        isUserFetching={isUserFetching}
        onPaymentClick={() => setShowPaymentModal(true)}
        onHistoryClick={handleHistoryClick}
      />
      <ScriptCards scripts={scripts} onScriptClick={setSelectedScript} />
      <ScriptModal
        user={user}
        script={selectedScript}
        onClose={() => setSelectedScript(null)}
        onSubmit={handleSubmitCall}
        onSignUp={() => setShowAuthModal(true)}
        onClickPay={() => setShowPaymentModal(true)}
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
        onClose={() => setShowAccountModal(false)}
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
        onRetry={(newCallSid) => setCallSid(newCallSid)}
      />
    </div>
  );
}

export default App;
