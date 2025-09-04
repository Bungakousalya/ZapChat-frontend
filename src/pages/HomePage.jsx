// 📁 pages/HomePage.jsx
import React, { useState,useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../context/ChatContext';

const HomePage = () => {
  
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className='w-full h-screen sm:px-[15%] sm:py-[5%]'>
      <div className={`grid h-full backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden
        ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'grid-cols-1 md:grid-cols-2'}`}>
        <Sidebar />
        <ChatContainer/> 
       {selectedUser && <RightSidebar />}
      </div>
    </div>
  );
};

export default HomePage;