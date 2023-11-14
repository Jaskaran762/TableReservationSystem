import axios from "axios";
const createReservation = (data)=>{
        return axios.post('https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations', data);
}
const fetchReservations = async (uid) => {
    try {
        const queryString = `userId=${uid}`;
        console.log(queryString);
        return axios.get(`https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations?${queryString}`);

        // const response = await axios.get('https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations');
        // console.log("reservations->"+response);
        // console.log("reservations->"+response.data);
        // return response.data;
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

const fetchAvailableSlots = async (date,start,end,restaurantId) =>{
    // const queryParams = {
    //     date: date,
    //     start: start,
    //     end: end,
    //     restaurantId: restaurantId
    // };
    const queryString = `date=${date}&start=${start}&end=${end}&restaurantId=${restaurantId}`;
    console.log(queryString);
        return axios.get(`https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/getAvailableSlots?${queryString}`);
}
const updateReservation = async (documentId,data) =>{
    // const queryParams = {
    //     date: date,
    //     start: start,
    //     end: end,
    //     restaurantId: restaurantId
    // };
    return axios.put(`https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations/${documentId}`, data);
}
export {createReservation,fetchReservations,fetchReservation,fetchAvailableSlots,updateReservation};