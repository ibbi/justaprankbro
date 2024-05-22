import React, { useState } from "react";
import "./App.css";

function App() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleInputChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/makecall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });
      const data = await response.json();
      setResponseMessage(data.phone_number);
    } catch (error) {
      console.error("Error making call:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={handleSubmit}>
          <label>
            Phone Number:
            <input
              type="text"
              value={phoneNumber}
              onChange={handleInputChange}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
        <p>{responseMessage}</p>
      </header>
    </div>
  );
}

export default App;
