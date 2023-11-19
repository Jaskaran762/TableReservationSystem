import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TableBookings() {
  const [bookings, setBookings] = useState({});
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('https://29fjaz7bu8.execute-api.us-east-1.amazonaws.com/dev/table-booking-views')
      .then(response => {
        setBookings(JSON.parse(response.data.body)); // Parse the JSON string
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error);
        setIsLoading(false);
      });
  }, []);

  const renderBookingDetails = (details) => (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Time Interval</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(details).map(([date, timeSlots]) => (
          Object.entries(timeSlots).map(([time, count]) => (
            <tr key={`${date}-${time}`}>
              <td>{date}</td>
              <td>{time}</td>
              <td>{count}</td>
            </tr>
          ))
        ))}
      </tbody>
    </table>
  );

  const renderSelectedDetails = () => {
    const bookingData = bookings[selectedRestaurant];
    return bookingData ? (
      <div>
        <h4>{selectedTimeFrame.charAt(0).toUpperCase() + selectedTimeFrame.slice(1)} Bookings</h4>
        {renderBookingDetails(bookingData[selectedTimeFrame])}
      </div>
    ) : <p>No data</p>;
  };

  const handleRestaurantChange = (event) => {
    setSelectedRestaurant(event.target.value);
  };

  const handleTimeFrameChange = (event) => {
    setSelectedTimeFrame(event.target.value);
  };

  if (isLoading) return <p>Loading</p>;
  if (error) return <p>Error loading</p>;

  return (
    <div>
      <h2>Table Bookings</h2>
      <div>
        <label htmlFor="restaurant-select">Select Restaurant:</label>
        <select id="restaurant-select" onChange={handleRestaurantChange} value={selectedRestaurant}>
          <option value="">-</option>
          {Object.keys(bookings).map(restaurant => (
            <option key={restaurant} value={restaurant}>{restaurant}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="timeframe-select">Select Time Interval:</label>
        <select id="timeframe-select" onChange={handleTimeFrameChange} value={selectedTimeFrame}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      {selectedRestaurant && renderSelectedDetails()}
    </div>
  );
}

export default TableBookings;