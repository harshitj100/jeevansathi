"use client"
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { login } from './authSlice'
import React, { useEffect } from 'react'
import { Provider, useDispatch, useSelector } from "react-redux"; 
import { RootState as AppRootState, AppDispatch as AppAppDispatch } from './store'; // Avoid name collision

export const store = configureStore({
    reducer: {
        auth: authReducer
    }
})

// Define RootState and AppDispatch types based on the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Create a new component to handle the re-hydration logic
function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector((state: RootState) => state.auth.status);

  useEffect(() => {
    // We only want to run this once on initial load, and only if we are not already logged in
    if (!authStatus && typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          // Parse the stored user data
          const parsedUserData = JSON.parse(userData);
          // Dispatch the login action to re-hydrate the state
          dispatch(login({ 
            userData: { 
              ...parsedUserData, 
              token: token 
            } 
          }));
        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
          // Clear bad data
          localStorage.removeItem('userToken');
          localStorage.removeItem('userData');
        }
      }
    }
  }, [dispatch, authStatus]); // Run only when dispatch or authStatus changes

  return <>{children}</>;
}


export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        {/* AuthLoader will now handle checking localStorage */}
        <AuthLoader>
          {children}
        </AuthLoader>
      </Provider>
    )
}