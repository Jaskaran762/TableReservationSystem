import { createSlice } from "@reduxjs/toolkit";
import {auth} from "../../config/firebase";
import {signOut} from "firebase/auth";
import {navigate, useNavigate} from "react-router-dom";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        token: null,
        user: null,
        loginType: null
    },
    reducers: {
        login: (state, action) => {
            console.log("Action Payload:"+action.payload);
            state.token = action.payload;
            console.log("The Token has been set")
        }, setToken:(state, action) =>{
            console.log("Set Token Called!");
            console.log(action.payload);
        }
    ,setUserDetails:(state,action)=>{
            console.log("Setting up User details;");
            state.user = action.payload;
        },setUserLoginType:(state,action)=>{
            console.log("Setting up Login Type;");
            state.loginType = action.payload
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.loginType = null;
        }
    }
});

export const { login, logout ,setUserDetails,setUserLoginType} = userSlice.actions;

export const selectUserToken = (state) => state.token;
export const selectUser = (state) => state.user;
export const selectLoginType = (state) => state.loginType;

export default userSlice.reducer;