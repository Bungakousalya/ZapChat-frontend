// React hooks and context imports
import React, { useRef, useEffect, useContext, useState } from 'react';

// Local assets and libraries
import assets from '../assets/assets';                // Image and icon assets
import toast from 'react-hot-toast';                  // Notification library
import { ChatContext } from '../context/ChatContext'; // Chat-related context provider
import { AuthContext } from '../context/AuthContext'; // Auth-related context provider

const ChatContainer = () => {
  // Accessing values from contexts
  const {
    selectedUser,     // Currently selected chat user
    setSelectedUser,  // Function to deselect user (go back)
    messages,         // All messages with selected user
    sendMessage,      // Function to send message
    getMessages       // Function to fetch messages
  } = useContext(ChatContext);

  const {
    authUser,         // Logged-in user's info
    onlineUsers       // List of currently online user IDs
  } = useContext(AuthContext);

  // Ref to scroll to bottom of chat
  const scrollEnd = useRef();

  // Local state to manage text input
  const [input, setInput] = useState('');

  //  Handles sending a text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;                 // Prevent sending empty messages
    await sendMessage({ text: input.trim() }); // Send message via context function
    setInput('');                              // Clear input after sending
  };

  //  Handles sending an image message
  const handleSendImage = async (e) => {
    const file = e.target.files[0];            // Get the selected file
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Convert image to base64 string
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result }); // Send image
      e.target.value = '';                         // Reset input
    };
    reader.readAsDataURL(file);                    // Read file as base64
  };

  //  Formats message timestamp into human-readable time
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  //  Fetch messages when a new user is selected
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  //  Scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  //  If no user is selected, show default welcome screen
  if (!selectedUser) {
    return (
      <div className="hidden md:flex h-full w-full flex-col items-center justify-center gap-2 text-gray-500 bg-white/10">
        <img src={assets.logo_icon} alt="chat icon" className="w-20 h-20" />
        <p className="text-gray-400 text-sm mt-2">Chat anytime, anywhere</p>
      </div>
    );
  }

  //  Main Chat UI
  return (
    <div className="h-full flex flex-col min-h-0">
      {/*  Header Section */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500 flex-shrink-0'>
        {/* User profile picture */}
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="profile"
          className='w-10 h-10 rounded-full'
        />

        {/* User name and online status */}
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser?.fullName}
          {/* Green dot if user is online */}
          {onlineUsers.includes(selectedUser._id) &&
            <span className='w-2 h-2 rounded-full bg-green-500'></span>}
        </p>

        {/* Back arrow for mobile */}
        <img
          onClick={() => setSelectedUser(null)}       // Deselect user
          src={assets.arrow_icon}
          alt="back"
          className='md:hidden max-w-7 cursor-pointer'
        />

        {/* Help icon (only on desktop) */}
        <img src={assets.help_icon} alt="help" className='max-md:hidden max-w-5' />
      </div>

      {/*  Messages Section */}
      <div className='flex-1 overflow-y-auto p-3 pb-6 min-h-0'>
        {messages.map((msg, index) => {
          const isMine = msg.senderId === authUser._id; // Check if message is sent by me

          return (
            <div
              key={index}
              className={`flex items-end gap-2 justify-end ${!isMine && 'flex-row-reverse'}`}
            >
              {/* Show sender’s profile pic if it’s not mine */}
              {!isMine && (
                <img
                  src={selectedUser?.profilePic || assets.avatar_icon}
                  alt="sender"
                  className="w-7 h-7 rounded-full mb-7"
                />
              )}

              {/* Show image or text message */}
              {msg.image ? (
                <div>
                  <img
                    src={msg.image}
                    alt="sent-media"
                    className="max-w-[230px] border border-grey-700 rounded-lg overflow-hidden mb-1"
                  />
                  <p className="text-[10px] text-gray-400 text-right">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              ) : (
                <div>
                  <p
                    className={`
                      p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-1 break-all text-white
                      bg-violet-500/30 ${isMine ? 'rounded-br-none' : 'rounded-bl-none'}
                    `}
                  >
                    {msg.text}
                  </p>
                  <p className="text-[10px] text-gray-400 text-right">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        {/* Invisible div for scroll-to-bottom ref */}
        <div ref={scrollEnd}></div>
      </div>

      {/*  Input Field Section */}
      <div className='flex items-center justify-between gap-3 px-3 py-3 mx-1 border-t bg-gray-100/12 flex-shrink-0'>
        {/* Message Input */}
        <div className='flex items-center gap-2 flex-1 px-4 py-2 rounded-full'>
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Message"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
            className="flex-1 text-sm text-white bg-transparent outline-none placeholder-gray-300"
          />

          {/* Hidden image input */}
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png,image/jpeg"
            hidden
          />

          {/* Image upload button */}
          <label htmlFor="image" className='cursor-pointer'>
            <img src={assets.gallery_icon} alt="Upload" className='w-5 h-5' />
          </label>
        </div>

        {/* Send Button */}
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="Send"
          className='w-7 h-7 cursor-pointer'
        />
      </div>
    </div>
  );
};

export default ChatContainer;
