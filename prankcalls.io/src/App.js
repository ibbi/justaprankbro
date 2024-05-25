import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    console.log("API URL:", process.env.REACT_APP_API_URL);
  }, []);

  const handleInputChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setResponseMessage(data.phone_number);
    } catch (error) {
      console.error("Error making call:", error);
    }
  };

  return (
    <div className="App">
      <header className="w-full bg-blue-500 flex flex-col justify-center items-center text-white p-12">
        <h1 className="text-5xl font-bold">PrankRing</h1>
        <p className="text-2xl">Where the pranks ring</p>
      </header>
      <main className="flex flex-col items-center mt-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-full max-w-sm"
        >
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Phone Number:
            <input
              type="text"
              value={phoneNumber}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded w-full"
            />
          </label>
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
        <p className="mt-4 text-gray-700">{responseMessage}</p>
      </main>
    </div>
  );
}

export default App;
