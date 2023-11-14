import { createSlice } from "@reduxjs/toolkit";
import {auth} from "../../config/firebase";
import {signOut} from "firebase/auth";
import {navigate, useNavigate} from "react-router-dom";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        token: null,
        user: null
    },
    reducers: {
        login: (state, action) => {
            console.log("Action Payload:"+action.payload);
            state.token = action.payload;
        },setUserDetails:(state,action)=>{
            console.log("Setting up User details;");
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
        }
    }
});

export const { login, logout ,setUserDetails} = userSlice.actions;

export const selectUserToken = (state) => state.token;
export const selectUser = (state) => state.user;

export default userSlice.reducer;