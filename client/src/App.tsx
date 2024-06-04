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
  User,
  createUser,
  getUser,
} from "./api";
import ScriptCards from "./components/ScriptCards";
import ScriptModal from "./components/ScriptModal";
import AuthModal from "./components/AuthModal";
import AccountModal from "./components/AccountModal";
import {
  User as fbUserType,
  getAdditionalUserInfo,
  onAuthStateChanged,
} from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";

function App() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<fbUserType | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isUserFetching, setIsUserFetching] = useState(true);

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

  useEffect(() => {
    console.log(firebaseUser);
    console.log(user);
  }, [firebaseUser, user]);

  const handleSubmitCall = async (
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

  const handleUserSignUp = async (email: string, password: string) => {
    try {
      const userCreds = await signUpWithEmail(email, password);
      const createdUser = await createUser(userCreds.user.email || undefined);
      setUser(createdUser);
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  const handleUserSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleGoogleSignUp = async () => {
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

  const handleGoogleSignIn = async () => {
    try {
      await authWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="dark text-foreground bg-background h-screen">
      <Hero
        user={user}
        onSignUpClick={() => setShowAuthModal(true)}
        onAccountClick={() => setShowAccountModal(true)}
        isUserFetching={isUserFetching}
      />
      <Divider />
      <ScriptCards
        scripts={scripts}
        onScriptClick={(s) => setSelectedScript(s)}
      />
      <ScriptModal
        script={selectedScript}
        onClose={() => setSelectedScript(null)}
        onSubmit={handleSubmitCall}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onUserSignUp={handleUserSignUp}
        onUserSignIn={handleUserSignIn}
        onGoogleSignUp={handleGoogleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
      />
      <AccountModal
        isOpen={showAccountModal}
        onClose={handleCloseAccountModal}
        user={user}
        onSignOut={handleSignOut}
      />
      <p>{callStatus}</p>
    </div>
  );
}

export default App;
