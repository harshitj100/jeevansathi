'use client'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type UserData = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  token: string;
} | null;

type AuthState = {
    status: boolean,
    userData: UserData
}

const initialState: AuthState = {
    status: false,
    userData: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ userData: UserData }>) => {
            state.status = true;
            state.userData = action.payload.userData;
            if (typeof window !== 'undefined' && action.payload.userData) {
              localStorage.setItem('userToken', action.payload.userData.token);
              // We can also store a minimal user object
              localStorage.setItem('userData', JSON.stringify({
                _id: action.payload.userData._id,
                firstname: action.payload.userData.firstname,
                lastname: action.payload.userData.lastname, // <-- ADDED THIS LINE
                email: action.payload.userData.email
              }));
            }
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
            if (typeof window !== 'undefined') {
              localStorage.removeItem('userToken');
              localStorage.removeItem('userData');
            }
        }
    }
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
