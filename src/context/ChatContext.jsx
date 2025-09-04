// Import necessary modules and hooks
import { createContext } from "react"; // Creates a new context
import { useContext, useState, useEffect } from "react"; // React hooks
import { AuthContext } from "./AuthContext.jsx"; // Import AuthContext for access to auth-related data
import axios from "axios"; // For making HTTP requests
import toast from "react-hot-toast"; // For displaying notifications
// Create a context for chat-related data and functions
export const ChatContext = createContext();

// Provider component that wraps the app and provides chat state
export const ChatProvider = ({ children }) => {

  // State to store all chat messages for the selected user
  const [messages, setMessages] = useState([]);

  // State to store list of users the current user has chatted with
  const [Users, setUsers] = useState(null);

  // State to store which user is currently selected in chat
  const [selectedUser, setSelectedUser] = useState(null);

  // State to store unseen message counts for each user
  const [unseenMessages, setUnseenMessages] = useState({});

  // Access socket and axios from AuthContext
  const { socket, axios } = useContext(AuthContext);

  // Function to fetch all users the current user has messaged
  const getUsers = async () => {
    try {
      const { data } = await axios.get('/api/messages/users'); // API call to get users
      if (data.success) {
        setUsers(data.users); // Set users list
        setUnseenMessages(data.unseenMessages); // Set unseen messages count
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error(error.message);
    }
  };

  // Function to fetch chat messages for the selected user
const getMessages = async (userId) => {
  try {
    // 1. Fetch the chat history
    const { data } = await axios.get(`/api/messages/${userId}`);
    if (data.success) {
      setMessages(data.messages);

      // 2. Mark ALL messages from this user as seen
      await axios.put(`/api/messages/mark/${userId}`);

      // 3. Update unseen count locally
      setUnseenMessages((prev) => ({
        ...prev,
        [userId]: 0,
      }));
    }
  } catch (error) {
    toast.error(error.message);
  }
};


  // Function to send a message to the selected user
  const sendMessage = async (messageData) => {
    try {
      // Post the message to backend and store in DB
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);

      if (data.success) {
        // Update UI instantly with the new message
        setMessages((prev) => [...prev, data.data]);

        // Send the message in real-time via socket to the recipient
        socket.emit("new-message", data.data);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error.message);
    }
  };

  // Function to listen for real-time messages from socket server
  const subscribeToMessages = async () => {
    if (!socket) return; // Skip if no socket connection

    // Listen for "newMessage" events from the socket
    socket.on("newMessage", (newMessage) => {
      // If the message is from the currently selected user
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true; // Mark as seen

        // Add it to message state so it appears in chat window
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Inform backend that the message has been seen
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        // If it's from someone else, update unseen message count of that persons chat
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // Function to stop listening to socket messages
  const unsubscribeFromMessages = () => {
    if (socket) {
  socket.off("newMessage");
}
 // If no socket, do nothing

    
  };

  // Automatically subscribe to socket messages on mount and clean up on unmount
  useEffect(() => {
    subscribeToMessages(); // Start listening when component mounts
    return () => {
      unsubscribeFromMessages(); // Clean up listener when component unmounts or deps change
    };
  }, [socket, selectedUser]); // Run again if socket or selected user changes

  // Values provided to children components that use this context
  const value = {
    messages,
    setMessages,
    Users,
    setUsers,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getUsers,
    getMessages,
    sendMessage,
  };

  // Provide the context value to all children
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
