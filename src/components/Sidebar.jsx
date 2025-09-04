import React, { useContext, useState, useEffect } from 'react';
import assets from '../assets/assets'; // Import images and icons
import { useNavigate } from 'react-router-dom'; // For navigation
import { AuthContext } from '../context/AuthContext'; // Auth context
import { ChatContext } from '../context/ChatContext'; // Chat context

const Sidebar = () => {
  // Destructure needed data/functions from context
  const {
    getUsers,            // Function to fetch all users
    Users,               // List of all users
    selectedUser,        // Currently selected user in chat
    setSelectedUser,     // Function to set selected user
    unseenMessages,      // Object holding unseen message counts
    setUnseenMessages,   // Function to update unseen messages
  } = useContext(ChatContext);

  const {
    logout,              // Function to log out user
    onlineUsers,         // List of online user IDs
    authUser             // Current authenticated user
  } = useContext(AuthContext);

  const [input, setInput] = useState('');  // For search input
  const navigate = useNavigate();          // To navigate routes

  // Filter out the current user and apply search filter
  const filteredUsers = (Users || [])
    .filter(user => user._id !== authUser?._id) // Remove self from user list
    .filter(user =>
      user.fullName.toLowerCase().includes(input.toLowerCase()) // Apply search
    );

  // Fetch users whenever onlineUsers changes
  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div
      className={`
        bg-[#8185b2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white 
        ${selectedUser ? 'max-md:hidden' : ''}
      `}
    >
      {/* ===== Logo and Menu Section ===== */}
      <div className="flex justify-between items-center">
        {/* Logo */}
        <img src={assets.logo} alt="logo" className="max-w-40" />

        {/* Menu Icon + Dropdown */}
        <div className="relative group py-2">
          <img
            src={assets.menu_icon}
            alt="menu"
            className="max-h-5 cursor-pointer"
          />
          {/* Dropdown Menu */}
          <div className="
            absolute top-full right-0 z-20 w-32 p-5 rounded-md 
            bg-[#282142] border border-gray-600 text-gray-100 
            hidden group-hover:block
          ">
            <p
              onClick={() => navigate('/profile')}
              className="cursor-pointer text-sm"
            >
              Edit Profile
            </p>
            <hr className="my-2 border-t border-gray-600" />
            <p className="cursor-pointer text-sm" onClick={logout}>
              Logout
            </p>
          </div>
        </div>
      </div>

      {/* ===== Search Bar ===== */}
      <div className="bg-[#282142] flex items-center rounded-full gap-2 py-2 px-3 mt-5">
        <img src={assets.search_icon} alt="search" className="w-3" />
        <input
          type="text"
          placeholder="Search User..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent border-none text-white outline-none text-xs"
        />
      </div>

      {/* ===== User List Section ===== */}
      <div className="flex flex-col mt-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              key={user._id || index}
              onClick={() => setSelectedUser(user)} // Select user on click
              className={`
                relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm
                ${selectedUser?._id === user._id ? 'bg-[#282142]/50' : ''}
              `}
            >
              {/* Profile picture */}
              <img
                src={user?.profilePic || assets.avatar_icon}
                alt="profile"
                className="w-[35px] aspect-[1/1] rounded-full"
              />

              {/* User name + Online status */}
              <div className="flex flex-col leading-5">
                <p>{user.fullName}</p>
                {onlineUsers?.includes(user._id) ? (
                  <span className="text-green-400 text-xs">Online</span>
                ) : (
                  <span className="text-gray-400 text-xs">Offline</span>
                )}
              </div>

              {/* Unseen message badge */}
              {unseenMessages[user._id] > 0 && (
                <p className="absolute top-4 right-4 text-xs h-5 w-5 flex items-center justify-center rounded-full bg-violet-600">
                  {unseenMessages[user._id]}
                </p>
              )}
            </div>
          ))
        ) : (
          // No users or no search results
          <p className="text-white text-center mt-4">
            {input ? 'No users found' : 'No users available'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
