import axios from "axios";
const createReservation = (data)=>{
        return axios.post('https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations', data);
}
const fetchReservations = async (query) => {
    try {
        const response = await axios.get('https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations');
        console.log("reservations->"+response);
        console.log("reservations->"+response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return [];
    }
};
const fetchReservation = async (reservationId) => {
    try {
        const response = await axios.get('https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations/'+reservationId);
        console.log("reservations->"+response);
        console.log("reservations->"+response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching reservation:', error);
        return {};
    }
};
export {createReservation,fetchReservations,fetchReservation};