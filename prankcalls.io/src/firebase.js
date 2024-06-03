import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCTsZHC7Q_oOspK59VCQA3IBby0EXBNgR0",
  authDomain: "prankring-ca26f.firebaseapp.com",
  projectId: "prankring-ca26f",
  storageBucket: "prankring-ca26f.appspot.com",
  messagingSenderId: "797762151414",
  appId: "1:797762151414:web:e45a5119d7503c7d275dd7",
  measurementId: "G-NFE26T970W",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword };
