// 📁 pages/LoginPage.jsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import assets from '../assets/assets'; // Importing assets like the logo

const LoginPage = () => {
  // -------------------- States for form inputs --------------------
  const [currnState, setCurrnState] = useState('Sign up'); // Toggle between Login and Sign up
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');

  const { login } = useContext(AuthContext); // Auth context to login or signup
  const navigate = useNavigate(); // Hook to navigate to another page

  // -------------------- Toggle between Login and Sign up --------------------
  const toggleForm = () => {
    setCurrnState(currnState === 'Login' ? 'Sign up' : 'Login');
    setFullName('');
    setEmail('');
    setPassword('');
    setBio('');
  };

  // -------------------- Form Submit Handler --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Decide whether it's a login or signup
    const authType = currnState === 'Sign up' ? 'signup' : 'login';

    // Prepare credentials object
    const credentials =
      authType === 'signup'
        ? { fullName, email, password, bio }
        : { email, password };

    // Call login function from context
    await login(authType, credentials);

    // Redirect based on action
    if (authType === 'signup') {
      setCurrnState('Login'); // After sign-up, redirect to login
    } else {
      navigate('/'); // After login, go to homepage
    }
  };

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* Logo Image */}
      <img
        src={assets.logo_big}
        alt="Logo"
        className='w-[min(30vw,250px)]'
      />

      {/* -------------------- Login / Signup Form -------------------- */}
      <form
        onSubmit={handleSubmit}
        className='border-2 bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-5 rounded-lg shadow-lg w-[min(90vw,400px)]'
      >
        <h2 className='font-medium text-2xl text-center'>{currnState}</h2>

        {/* Full Name and Bio only in Sign up */}
        {currnState === 'Sign up' && (
          <>
            <input
              type="text"
              placeholder='Full Name'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className='p-2 border border-gray-500 rounded-md bg-transparent outline-none placeholder-gray-300'
            />
            <textarea
              rows={2}
              placeholder="Provide a short Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className='p-2 border border-gray-500 rounded-md bg-transparent outline-none placeholder-gray-300 resize-none'
            />
          </>
        )}

        {/* Common Fields for Both Login & Sign up */}
        <input
          type="email"
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className='p-2 border border-gray-500 rounded-md bg-transparent outline-none placeholder-gray-300'
        />

        <input
          type="password"
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className='p-2 border border-gray-500 rounded-md bg-transparent outline-none placeholder-gray-300'
        />

        {/* Submit Button */}
        <button
          type="submit"
          className='py-2 rounded-full bg-gradient-to-r from-purple-400 to-violet-600 text-sm font-light'
        >
          {currnState}
        </button>

        {/* Toggle between Login & Sign up */}
        <p className='text-center text-sm mt-2'>
          {currnState === 'Login' ? (
            <>
              Don't have an account?{' '}
              <span
                onClick={toggleForm}
                className='text-purple-300 underline cursor-pointer'
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span
                onClick={toggleForm}
                className='text-purple-300 underline cursor-pointer'
              >
                Login
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
