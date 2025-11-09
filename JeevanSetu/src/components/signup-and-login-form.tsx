"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label"; // It's okay if this path is slightly off, @/ is an alias
import { Input } from "@/components/ui/input"; // It's okay if this path is slightly off, @/ is an alias
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login as reduxLogin } from '@/globalContext/authSlice';
import { useRouter } from 'next/navigation';
// Import your config
import { config } from '@/components/config/env'; 

// --- NUMBER LOGIN (No changes to this function) ---
export function NumberLogin() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  };
  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      <LabelInputContainer className="mb-4">
        <Label htmlFor="phoneNumber">Phone number</Label>
        <Input id="phoneNumber" placeholder="xxxxxx2398" type="tel" />
      </LabelInputContainer>
      <button
        className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
        type="submit"
      >
        OTP Login &rarr;
        <BottomGradient />
      </button>
    </form>
  );
}

// --- EMAIL LOGIN (NEW CODE) ---
export function EmailLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    console.log("Attempting to login..."); // New console log
    try {
      const { data } = await axios.post(`${config.apiUrl}/api/auth/login`, {
        email,
        password,
      });
      
      console.log("Login successful:", data); // New console log
      
      // Dispatch login action to Redux
      dispatch(reduxLogin({ userData: data }));
      
      // Redirect to dashboard
      router.push('/');
      
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      console.error("Login error:", message); // New console log
    }
  };

  return (
    <form className="my-8" onSubmit={handleSubmit}>
      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
      <LabelInputContainer className="mb-4">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          placeholder="abc@gmail.com" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </LabelInputContainer>
      <LabelInputContainer className="mb-4">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          placeholder="••••••••" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </LabelInputContainer>

      <button
        className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
        type="submit"
      >
        Login &rarr;
        <BottomGradient />
      </button>

      <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

      <div className="flex flex-col space-y-4">
        <button
          className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
          type="button" // Changed to button to avoid form submission
        >
          <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Google
          </span>
          <BottomGradient />
        </button>
      </div>
    </form>
  );
}

// --- NUMBER SIGNUP (No changes to this function) ---
export function NumberSignUp() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  };
  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <LabelInputContainer>
          <Label htmlFor="firstname">First name</Label>
          <Input id="firstname" placeholder="Tyler" type="text" />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="lastname">Last name</Label>
          <Input id="lastname" placeholder="Durden" type="text" />
        </LabelInputContainer>
      </div>
      <LabelInputContainer className="mb-4">
        <Label htmlFor="phoneNumber">Phone number</Label>
        <Input id="phoneNumber" placeholder="xxxxxx2398" type="tel" />
      </LabelInputContainer>

      <button
        className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
        type="submit"
      >
        Verify Number &rarr;
        <BottomGradient />
      </button>
    </form>
  );
}

// --- EMAIL SIGNUP (NEW CODE) ---
export function EmailSignUp() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    console.log("Attempting to sign up..."); // New console log
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const { data } = await axios.post(`${config.apiUrl}/api/auth/register`, {
        firstname,
        lastname,
        email,
        password,
      });

      console.log("Signup successful:", data); // New console log
      
      // Dispatch login action to Redux
      dispatch(reduxLogin({ userData: data }));

      // Redirect to dashboard
      router.push('/');

    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(message);
      console.error("Signup error:", message); // New console log
    }
  };

  return (
    <form className="my-8" onSubmit={handleSubmit}>
      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
      <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <LabelInputContainer>
          <Label htmlFor="firstname">First name</Label>
          <Input 
            id="firstname" 
            placeholder="Name" 
            type="text"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            required
          />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="lastname">Last name</Label>
          <Input 
            id="lastname" 
            placeholder="Surname" 
            type="text"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
          />
        </LabelInputContainer>
      </div>
      <LabelInputContainer className="mb-4">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          placeholder="abc@gmail.com" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </LabelInputContainer>
      <LabelInputContainer className="mb-4">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          placeholder="••••••••" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </LabelInputContainer>

      <button
        className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
        type="submit"
      >
        Sign up &rarr;
        <BottomGradient />
      </button>

      <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

      <div className="flex flex-col space-y-4">
        <button
          className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
          type="button" // Changed to button
        >
          <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Google
          </span>
          <BottomGradient />
        </button>CH
      </div>
    </form>
  );
}

// --- BOTTOM GRADIENT (No changes) ---
export const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

// --- LABEL INPUT CONTAINER (No changes) ---
const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};