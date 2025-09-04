import React, { useState, useEffect, useContext } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const RightSidebar = () => {
  // Access global states from Auth and Chat context
  const { logout, onlineUsers } = useContext(AuthContext);  
  const { selectedUser, messages } = useContext(ChatContext);

  // Local state to hold only message images
  const [msgImages, setMsgImages] = useState([]);

  // Whenever messages change, extract only images and update local state
  useEffect(() => {
    const filteredImages = messages
      .filter(msg => msg.image)       // Filter messages with an image
      .map(msg => msg.image);         // Extract only the image URL

    setMsgImages(filteredImages);
  }, [messages]);

  // If no user is selected, don’t render the sidebar
  if (!selectedUser) return null;

  return (
    <div
      className={`
        bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll 
        ${selectedUser ? "max-md:hidden" : ""}
      `}
    >

      {/* ===== User Profile Section ===== */}
      <div className="flex flex-col items-center font-light mx-auto gap-2 pt-16">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="profile"
          className="w-20 aspect-[1/1] rounded-full"
        />

        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          {/* Show green dot if user is online */}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
          {selectedUser.fullName}
        </h1>

        <p className="px-10 mx-auto text-center">
          {selectedUser.bio}
        </p>
      </div>

      {/* ===== Divider Line ===== */}
      <hr className="border-[#ffffff50] my-4" />

      {/* ===== Media Section ===== */}
      <p className="px-4 font-medium">Media</p>
      <div className="mt-2 px-4 grid grid-cols-2 gap-4 max-h-[200px] overflow-y-scroll opacity-80">
        {msgImages.map((url, index) => (
          <div
            key={index}
            onClick={() => window.open(url)}
            className="cursor-pointer rounded"
          >
            <img
              src={url}
              alt="media"
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        ))}
      </div>

      {/* ===== Logout Button ===== */}
      <button
        onClick={logout}
        className="
          absolute bottom-5 left-1/2 transform -translate-x-1/2 
          py-2 px-20 rounded-full text-sm font-light 
          bg-gradient-to-r from-purple-400 to-violet-600
        "
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
