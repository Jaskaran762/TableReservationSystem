import axios from "axios";

const infoEndpoint =
    "https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant";
const fetchRestaurantData = (restaurantId)=>{
    return axios.post(infoEndpoint, { name: restaurantId });
}

export {fetchRestaurantData};
