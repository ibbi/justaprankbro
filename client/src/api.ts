const API_URL = import.meta.env.VITE_API_URL;

export interface Script {
  title: string;
  agentId: string;
  image: string;
  sample_audio: string;
  fields: {
    form_label: string;
    variable_name: string;
    textbox_type: string;
  }[];
}

async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return await response.json();
}

export async function getScripts(): Promise<Record<string, Script>> {
  return await get<Record<string, Script>>("/scripts");
}
