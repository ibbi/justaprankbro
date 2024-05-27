import React, { useState, useEffect } from "react";
import "./App.css";
import Card from "./Card";
import Modal from "./Modal";
import { PRANK_TYPES } from "./constants";
import { RetellWebClient } from "retell-client-js-sdk";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

const webClient = new RetellWebClient();

function App() {
  const [visibleModal, setVisibleModal] = useState("");
  const [callStatus, setCallStatus] = useState("none");
  const [callData, setCallData] = useState({});

  const [recordingPlaying, setRecordingPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    // Setup event listeners
    webClient.on("conversationStarted", () => {
      console.log("conversationStarted");
    });

    webClient.on("audio", (audio) => {
      console.log("There is audio");
    });

    webClient.on("conversationEnded", ({ code, reason }) => {
      console.log("Closed with code:", code, ", reason:", reason);
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
    });

    webClient.on("update", (update) => {
      // Print live transcript as needed
      console.log("update", update);
    });
  }, []);

  const handleShowModal = (agentId) => {
    console.log(agentId);
    setVisibleModal(agentId);
  };

  const handleCloseModal = () => {
    setVisibleModal("");
  };

  const handleSubmit = async (phoneNumber, agentId, dynamicVars) => {
    setVisibleModal("");
    setCallStatus("registered");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/makecall`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_number: phoneNumber,
            agent_id: agentId,
            dynamic_vars: dynamicVars,
          }),
        }
      );

      const data = await response.json();
      console.log("****");
      console.log(data); // Handle the response as needed

      // if (data.call_id) {
      //   console.log("start conversation");
      //   webClient
      //     .startConversation({
      //       callId: data.call_id,
      //       sampleRate: data.sample_rate,
      //       enableUpdate: true,
      //     })
      //     .catch(console.error);
      // }

      // poll /getcall/{call_id} to get the call status
      let callStatus = "registered";
      while (callStatus !== "ended" && callStatus !== "error") {
        const callResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/getcall/${data.call_id}`
        );
        const callData = await callResponse.json();
        // setCallStatus(callData.call_status);
        callStatus = callData.call_status;
        setCallData(callData);
        console.log(callData);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error("Error making call:", error);
    }
  };

  const handlePlayRecording = () => {
    setRecordingPlaying(true);
    const newAudio = new Audio(callData.recording_url);
    newAudio.play();
    setAudio(newAudio);
  };

  const handleStopRecording = () => {
    setRecordingPlaying(false);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  return (
    <div className="App">
      <header className="w-full p-16 bg-blue-500 flex flex-col justify-center items-center text-white">
        <h1 className="text-5xl font-bold">PrankRing</h1>
        <div>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <main className="flex flex-col items-center mt-10">
        <div className="flex space-x-4">
          {PRANK_TYPES.map((p) => (
            <Card
              title={p.title}
              agentId={p.agentId}
              onCallClick={() => handleShowModal(p.agentId)}
            />
          ))}
        </div>
      </main>
      {visibleModal !== "" && (
        <Modal
          agentId={visibleModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}

      {callStatus === "none" ? (
        <div />
      ) : callStatus === "registered" ? (
        <div className="text-black">Ringing...</div>
      ) : callStatus === "ongoing" ? (
        <div className="text-black">Call in progress...</div>
      ) : callStatus === "ended" ? (
        <div className="text-black">Call ended</div>
      ) : (
        <div className="text-black">Error making call</div>
      )}

      {callStatus === "ended" && callStatus === "error" && callData && (
        <div className="text-black">
          <p>From number: {callData.from_number}</p>
          <p>To number: {callData.to_number}</p>
          <p>
            Prank status: {callData.call_analysis.agent_task_completion_rating}
          </p>
          <p>
            Prank status explanation:{" "}
            {callData.call_analysis.call_completion_rating_reason}
          </p>
          <p>Call summary: {callData.call_analysis.call_summary}</p>
          <p>Disconnection reason: {callData.disconnection_reason}</p>
          <p>Recording url: {callData.recording_url}</p>
          {recordingPlaying ? (
            <button onClick={handleStopRecording}>Stop recording</button>
          ) : (
            <button onClick={handlePlayRecording}>Play recording</button>
          )}
          <h2>Transcript</h2>
          {callData.transcript_object.map((transcript, index) => (
            <div key={index}>
              <p>
                {transcript.role}: {transcript.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
