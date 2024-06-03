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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function post<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to post to ${endpoint}`);
  }
  return await response.json();
}

export async function getScripts(): Promise<Record<string, Script>> {
  return await get<Record<string, Script>>("/scripts");
}

export async function makeCall(
  phoneNumber: string,
  agentId: string,
  dynamicVars: Record<string, string>
): Promise<{ call_id: string }> {
  return await post<{ call_id: string }>("/calls", {
    phone_number: phoneNumber,
    agent_id: agentId,
    dynamic_vars: dynamicVars,
  });
}

export async function getCallStatus(callId: string): Promise<{
  call_status: string;
  from_number: string;
  to_number: string;
  call_analysis: {
    agent_task_completion_rating: string;
    call_completion_rating_reason: string;
    call_summary: string;
  };
  disconnection_reason: string;
  recording_url: string;
  transcript_object: { role: string; content: string }[];
}> {
  return await get(`/calls/${callId}`);
}
