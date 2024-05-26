import React, { useState } from "react";
import { agentIds } from "./constants";

const Modal = ({ agentId, onClose, onSubmit }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dynamicVars, setDynamicVars] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      setPhoneNumber(value);
    } else {
      setDynamicVars((prevVars) => ({ ...prevVars, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(phoneNumber, agentId, dynamicVars);
    onClose();
  };

  const getDetailForm = () => {
    let fields = [];
    switch (agentId) {
      case agentIds.HIT_CAR:
        fields = [
          { label: "Name", name: "name" },
          { label: "Color", name: "color" },
          { label: "Make", name: "make" },
          { label: "Address", name: "address" },
        ];
        break;
      case agentIds.CALL_GIRL:
        fields = [
          { label: "Name", name: "name" },
          { label: "Girlfriend's name", name: "gf_name" },
        ];
        break;
      // Add more cases as needed for different agentIds
      default:
        fields = [];
    }
    return fields.map((field, index) => (
      <label key={index} className="block text-gray-700 text-sm font-bold mb-2">
        {field.label}:
        <input
          type="text"
          name={field.name}
          value={dynamicVars[field.name] || ""}
          onChange={handleInputChange}
          className="mt-1 p-2 border rounded w-full"
        />
      </label>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-4">Enter Details</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Phone Number:
            <input
              type="text"
              name="phoneNumber"
              value={phoneNumber}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded w-full"
            />
          </label>
          {getDetailForm()}
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
