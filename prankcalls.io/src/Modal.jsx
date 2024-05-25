import React, { useState } from "react";

const Modal = ({ agentId, onClose, onSubmit }) => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleInputChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ididid", agentId);
    onSubmit(phoneNumber, agentId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-4">Enter Phone Number</h2>
        <form onSubmit={handleSubmit}>
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
          <button
            type="button"
            onClick={onClose}
            className="mt-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700 ml-2"
          >
            Close
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
