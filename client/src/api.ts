const API_URL = import.meta.env.VITE_API_URL;

import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";

export async function getToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

async function get<T>(endpoint: string): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${endpoint}`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return await response.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function post<T>(endpoint: string, data: any): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to post to ${endpoint}`);
  }
  return await response.json();
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function authWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export interface Script {
  id: number;
  title: string;
  agent_id: string;
  image: string;
  sample_audio: string;
  cost: number;
  fields: {
    form_label: string;
    variable_name: string;
    textbox_type: string;
  }[];
}

export async function getScripts(): Promise<Record<string, Script>> {
  return await get<Record<string, Script>>("/scripts");
}

export async function makeCall(
  phoneNumber: string,
  scriptId: number,
  dynamicVars: Record<string, string>
): Promise<{ call_sid: string }> {
  return await post<{ call_sid: string }>("/calls", {
    phone_number: phoneNumber,
    script_id: scriptId,
    dynamic_vars: dynamicVars,
  });
}
export async function createUser(email?: string): Promise<User> {
  return await post<User>("/users/create", { email });
}

export interface User {
  user_id: string;
  firebase_uid: string;
  email: string;
  balance: number;
}

export async function getUser(): Promise<User | null> {
  return await get<User>("/users/me");
}

export async function createCheckoutSession(): Promise<{
  clientSecret: string;
}> {
  return await post<{ clientSecret: string }>("/pay/create", {});
}

export interface CallHistory {
  id: number;
  create_time: string;
  to_number: string;
  link_to_recording: string | null;
  script_title: string;
  script_image: string | null;
}

export async function getCallHistory(): Promise<CallHistory[]> {
  return await get<CallHistory[]>("/users/me/call-history");
}
