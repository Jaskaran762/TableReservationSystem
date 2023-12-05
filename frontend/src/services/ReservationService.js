// import axios from "axios";
import {axiosInstance} from './axiosInstance';
const createReservation = (data)=>{
        return axiosInstance.post('https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations', data);
}
const fetchReservations = async (uid) => {
    try {
        const queryString = `userId=${uid}`;
        console.log(queryString);
        return axiosInstance.get(`https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations?${queryString}`);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return [];
    }
};
const fetchReservationsForPartner = async (restaurantId) => {
    try {
        const queryString = `restaurantId=${restaurantId}`;
        console.log(queryString);
        return axiosInstance.get(`https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations?${queryString}`);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return [];
    }
};
const fetchReservation = async (reservationId) => {
    try {
        const response = await axiosInstance.get('https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations/'+reservationId);
        console.log("reservations->"+response);
        console.log("reservations->"+response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching reservation:', error);
        return {};
    }
};

const fetchAvailableSlots = async (date,start,end,restaurantId,tableName) =>{
    const queryString = `date=${date}&start=${start}&end=${end}&restaurantId=${restaurantId}&tableName=${tableName}`;
    console.log(queryString);
        return axiosInstance.get(`https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/getAvailableSlots?${queryString}`);
}
const updateReservation = async (documentId,data) =>{
    return axiosInstance.put(`https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations/${documentId}`, data);
}

const toggleReservationStatus = async (documentId,reservation) =>{
    reservation.isAcceptedByRestaurant = !reservation.isAcceptedByRestaurant;
    return axiosInstance.put(`https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations/${documentId}?from=statusToggle`,reservation);
}

export {createReservation,fetchReservations,fetchReservation
    ,fetchAvailableSlots,updateReservation,fetchReservationsForPartner,toggleReservationStatus};