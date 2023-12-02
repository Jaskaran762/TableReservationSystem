import axios from 'axios';
import LoadingIndicator from './LoadingIndicator';
import { useState } from 'react';
const axiosInstance = axios.create();

 const AxiosConfig = ({children}) => {
    const [loading, setLoading] = useState(false);
    axiosInstance.interceptors.request.use(
        (config) => {
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