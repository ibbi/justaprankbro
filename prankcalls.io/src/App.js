import React, { useState } from "react";
import "./App.css";
import Card from "./Card";
import Modal from "./Modal";
import { PRANK_TYPES } from "./constants";

function App() {
  const [visibleModal, setVisibleModal] = useState("");

  const handleShowModal = (agentId) => {
    console.log(agentId);
    setVisibleModal(agentId);
  };

  const handleCloseModal = () => {
    setVisibleModal("");
  };

  const handleSubmit = async (phoneNumber, agentId, dynamicVars) => {
    console.log(agentId);
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
      console.log(data); // Handle the response as needed
    } catch (error) {
      console.error("Error making call:", error);
    }
  };

  return (
    <div className="App">
      <header className="w-full p-16 bg-blue-500 flex flex-col justify-center items-center text-white">
        <h1 className="text-5xl font-bold">PrankRing</h1>
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
    </div>
  );
}

export default App;
