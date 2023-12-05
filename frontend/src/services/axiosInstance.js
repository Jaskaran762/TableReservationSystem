import axios from 'axios';
import LoadingIndicator from './LoadingIndicator';
import { useState } from 'react';
import { selectUserToken} from "../components/redux/userSlice";
import {useSelector} from "react-redux";
const axiosInstance = axios.create();

 const AxiosConfig = ({children}) => {
    const [loading, setLoading] = useState(false);
     // selectUserToken
     const token = useSelector(selectUserToken);
    axiosInstance.interceptors.request.use(
        (config) => {
            console.log("SelectUSerToken"+token);
            console.log(JSON.stringify(token));
            if(token){
                config.headers.setAuthorization(`Bearer ${token["token"]}`);
            }
            setLoading(true);
            return config;
        },
        (error) => {
            setLoading(false);
            return Promise.reject(error);
        }
    );

    axiosInstance.interceptors.response.use(
        (response) => {
            setLoading(false);
            return response;
        },
        (error) => {
            setLoading(false);
            return Promise.reject(error);
        }
    );
    return (
        <div>
            {loading && <LoadingIndicator/>}
            {children}
        </div>
    )
}


export { axiosInstance, AxiosConfig };