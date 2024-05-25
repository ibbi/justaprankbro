import React from "react";

const Card = ({ onCallClick }) => {
  return (
    <div
      className="bg-cover bg-center h-64 w-64 relative"
      style={{
        backgroundImage: `url('https://images.pexels.com/photos/235986/pexels-photo-235986.jpeg')`,
      }}
    >
      <button
        onClick={onCallClick}
        className="absolute bottom-0 left-0 w-full bg-blue-500 text-white py-2 hover:bg-blue-700"
      >
        Call
      </button>
    </div>
  );
};

export default Card;
