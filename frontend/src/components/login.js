import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import the Link component
import './home.css';

function Home() {
  const [city, setCity] = useState('');
  const [name, setName] = useState('');
  const [rating, setRating] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const requestBody = {};
    const fetchRestaurants = async () => {
      try {
        const apiEndpoint = 'https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant';
        const response = await axios.post(apiEndpoint, requestBody);

        const receivedRestaurants = response.data.restaurants || [];
        setRestaurants(receivedRestaurants);
      } catch (error) {
        setError(error);
      }
    };

    fetchRestaurants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiEndpoint = 'https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant';
    const requestBody = {
      city: city,
      rating: rating
    };

    try {
      const response = await axios.post(apiEndpoint, requestBody);

      const receivedRestaurants = response.data.restaurants || [];
      setRestaurants(receivedRestaurants);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error);
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h1>Restaurant Search</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>City: </label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label>Name: </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Rating (Min): </label>
            <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} />
          </div>
          <button type="submit">Search</button>
        </form>
        {error && <div>Error: {error.message}</div>}
      </div>
      <div className="content">
        <ul>
          {restaurants.map((restaurant) => (
            <li key={restaurant.name} className="res">
              {/* Wrap the contents in a Link component */}
              <Link to="/restaurant">
                <img src={restaurant.photo} alt={restaurant.name} width="100" />
                <div>Name: {restaurant.name}</div>
                <div>City: {restaurant.city}</div>
                <div>Location: {restaurant.location}</div>
                <div>Rating: {restaurant.resRating}</div>
                <div>Opening Time: {restaurant.openingTime}</div>
                <div>Closing Time: {restaurant.closingTime}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;
