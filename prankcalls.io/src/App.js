import React, { useState } from "react";
import "./App.css";
import Card from "./Card";
import Modal from "./Modal";

function App() {
  const [showModal, setShowModal] = useState(false);

  const handleCallClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (phoneNumber) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/makecall`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone_number: phoneNumber }),
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
          <Card onCallClick={handleCallClick} />
          <Card onCallClick={handleCallClick} />
          <Card onCallClick={handleCallClick} />
        </div>
      </main>
      <Modal
        showModal={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default App;
