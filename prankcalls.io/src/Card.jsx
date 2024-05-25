import React from "react";

const Card = ({ title, onCallClick }) => {
  return (
    <div
      className="flex flex-col justify-between bg-cover bg-center h-64 w-64 p-4"
      style={{
        backgroundImage: `url('https://images.pexels.com/photos/235986/pexels-photo-235986.jpeg')`,
      }}
    >
      <p className="text-white text-xl font-bold">{title}</p>
      <button
        onClick={onCallClick}
        className="bg-blue-500 text-white py-2 px-4 mt-4 hover:bg-blue-700"
      >
        Try prank
      </button>
    </div>
  );
};

export default Card;
