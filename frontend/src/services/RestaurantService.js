import axios from "axios";

const infoEndpoint =
    "https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant";
const fetchRestaurantData = (restaurantId)=>{
    return axios.post(infoEndpoint, { name: restaurantId });
}

const fetchRestaurantFullDetails = (restaurantId) =>{
    const url = `https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-partner-details?id=${restaurantId}`;
    return axios.get(url);
}

export {fetchRestaurantData,fetchRestaurantFullDetails};