import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "./redux/userSlice";
// import { v4 as uuidv4 } from "uuid";
const ImageService = require("../services/uploadImageService");

const CreateRestaurant = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    location: "",
    city: "",
    photo: "",
    discount:"",
  });
  const user = useSelector(selectUser);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRestaurantData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  function generateUniqueId() {
    // Get the current timestamp
    const timestamp = new Date().getTime();
  
    // Generate a random number (between 0 and 999999)
    const random = Math.floor(Math.random() * 1000);
  
    // Combine timestamp and random number to create a unique ID
    const uniqueId = parseInt(`${timestamp}${random}`);
  
    return uniqueId;
  }

  const handleSubmit = (e) => {
    restaurantData.photo = selectedImage;
    restaurantData.owner = user.user.email;
    restaurantData.restaurant_id = generateUniqueId();
    restaurantData.available = false;

    axios
      .post(
        `https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/create-restaurant`,
        restaurantData
      )
      .then(() => {navigate("/partnerAPP");});

    e.preventDefault();
    // Handle submitting the restaurant data, e.g., sending it to the server
    console.log("Submitting:", restaurantData);
    // After submission, navigate to a different page if needed
    navigate("/partnerAPP"); // Navigate to the partner dashboard or any other route
  };

  const handleFileChange = async (e) => {
    try {
      // Update the selected image when the file input changes
      console.log(e.target.files[0]);
      alert(e.target.files[0]);
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async function (event) {
        try {
          const imageData = reader.result; // Use reader.result instead of e.target.result
          const response = await ImageService.uploadImageData(imageData);
          setSelectedImage(response.data.message);
        } catch (uploadError) {
          // Handle error during image upload
          console.error("Error uploading image:", uploadError);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      // Handle other errors (e.g., if the file is not selected properly)
      console.error("Error handling file change:", error);
    }
  };

  return (
    <Container>
      <h2>Create a Restaurant</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="restaurantName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter restaurant name"
            name="name"
            value={restaurantData.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="restaurantLocation">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter location"
            name="location"
            value={restaurantData.location}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="restaurantCity">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter city"
            name="city"
            value={restaurantData.city}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="restaurantPhoto">
          <Form.Label>Upload Photo</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </Form.Group>
        <Form.Group controlId="restaurantDiscount">
          <Form.Label>Restaurant Discount (%)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter discount percentage"
            name="discount"
            value={restaurantData.discount}
            onChange={handleChange}
            required
          />
  </Form.Group>
        <br></br>
        <Button variant="primary" type="submit">
          Create Restaurant
        </Button>
      </Form>
    </Container>
  );
};

export default CreateRestaurant;
