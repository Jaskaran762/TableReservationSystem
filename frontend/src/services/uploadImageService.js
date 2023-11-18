import axios from "axios";

const infoEndpoint =
    "https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/upload-image";
const uploadImageData = (imageData)=>{
    return axios.post(infoEndpoint, { image: imageData });
}

export {uploadImageData};
