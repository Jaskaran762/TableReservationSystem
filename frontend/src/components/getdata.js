import React, { useState } from 'react';
import axios from 'axios';

function Getdata() {
  const [city, setCity] = useState('Halifax');
  const [rating, setRating] = useState('2');
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiEndpoint = 'https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant';
    const requestBody = {
      city: city,
      rating: rating
    };

    try {
      // Make a POST request
      const response = await axios.post(apiEndpoint, requestBody);

      // Handle the response data
      console.log(response.data);
      // Check if the 'restaurants' property is an array
      const receivedRestaurants = response.data.restaurants || [];
      setRestaurants(receivedRestaurants);
    } catch (error) {
      // Handle errors
      console.error('Error fetching data:', error);
      setError(error);
    }
  };

  return (
    <div>
      <h1>Restaurant Search</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>City: </label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label>Rating (Min): </label>
          <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} />
        </div>
        <button type="submit">Search</button>
      </form>
      {error && <div>Error: {error.message}</div>}
      <ul>
        {restaurants.map((restaurant) => (
          <li key={restaurant.name}>
            <img src={restaurant.photo} alt={restaurant.name} width="100" />
            <div>Name: {restaurant.name}</div>
            <div>City: {restaurant.city}</div>
            <div>Location: {restaurant.location}</div>
            <div>Rating: {restaurant.resRating}</div>
            <div>Opening Time: {restaurant.openingTime}</div>
            <div>Closing Time: {restaurant.closingTime}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Getdata;
