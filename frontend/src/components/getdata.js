import React, { useState } from 'react';

function Getdata() {
  const [city, setCity] = useState('Halifax'); // Defaulted to Halifax
  const [rating, setRating] = useState('2');   // Defaulted to 2
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const apiEndpoint = 'https://j7fjhegj3f.execute-api.us-east-1.amazonaws.com/default/get-data-restaurant';
    const requestBody = {
      city: city,
      rating: rating
    };

    fetch(apiEndpoint, {
      
      method: 'POST',
      headers: {
        //'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Headers':'*'
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => setRestaurants(data))
      .catch((err) => setError(err));
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