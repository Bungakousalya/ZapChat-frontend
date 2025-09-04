import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets"; // Ensure it includes bgImage, avatar_icon, chatIcon

const Profile = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [selectedImg, setSelectedImg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onloadend = async () => {
      const base64 = reader.result;
      await updateProfile({ fullName: name, profilePic: base64, bio });
      navigate("/");
    };
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-black bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${assets.bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-lg z-0" />

      {/* Profile Card */}
      <div className="relative z-10 w-full max-w-3xl mx-auto p-8 md:p-10 bg-white/10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 w-full flex flex-col gap-5"
        >
          <h2 className="text-white text-2xl font-semibold">Profile details</h2>

          {/* Avatar Upload */}
          <div className="flex items-center gap-3">
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic || assets.avatar_icon
              }
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border border-white/30"
            />
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept="image/*"
              onChange={(e) => setSelectedImg(e.target.files[0])}
            />
            <label
              htmlFor="fileInput"
              className="text-sm text-purple-300 cursor-pointer"
            >
              Upload profile image
            </label>
          </div>

          {/* Name Input */}
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 rounded-md bg-black/30 text-white border border-purple-500 placeholder:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Bio Input */}
          <textarea
            rows={3}
            placeholder="Hi Everyone, I am using QuickChat"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="p-2 rounded-md bg-black/30 text-white border border-purple-500 placeholder:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Save Button */}
          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-500 py-2 rounded-full text-white font-semibold hover:opacity-90 transition-all"
          >
            Save
          </button>
        </form>

        {/* Right: Chat Icon */}
          <img className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && 'rounded-full'}`} 

            src={assets.logo_icon}
            alt="Chat Icon"
            
          />
        
      </div>
    </div>
  );
};

export default Profile;
