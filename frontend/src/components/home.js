import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Nav from "react-bootstrap/Nav";
import Card from "react-bootstrap/Card";

function Home() {
  console.log("! in Home Component");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const requestBody = {};
    const fetchRestaurants = async () => {
      try {
        const apiEndpoint =
          "https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant";
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

    const apiEndpoint =
      "https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant";
    const requestBody = {
      city: city,
      rating: rating,
    };

    try {
      const response = await axios.post(apiEndpoint, requestBody);

      const receivedRestaurants = response.data.restaurants || [];
      setRestaurants(receivedRestaurants);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
    }
  };

  const navigatePage = (data) => {
    navigate("/restaurant", { state: { data } });
  };

  return (
    <>
      <div className="container">
        <div className="sidebar">
          <h1>Restaurant Search</h1>
          <form onSubmit={handleSubmit}>
            <Nav variant="tabs" defaultActiveKey="/home">
              <Nav.Item>
                <div>
                  <label>Name: </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      // Disable other inputs if 'name' is entered
                      setCity("");
                      setRating("");
                    }}
                    disabled={city !== "" || rating !== ""}
                  />
                </div>
              </Nav.Item>
              <Nav.Item>
                <div>
                  <label>City: </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      // Disable 'name' if 'city' is entered
                      if (e.target.value !== "") {
                        setName("");
                      }
                    }}
                    disabled={name !== ""}
                  />
                </div>
              </Nav.Item>
              <Nav.Item>
                <div>
                  <label>Rating (Min): </label>
                  <input
                    type="number"
                    value={rating}
                    onChange={(e) => {
                      setRating(e.target.value);
                      // Disable 'name' if 'rating' is entered
                      if (e.target.value !== "") {
                        setName("");
                      }
                    }}
                    disabled={name !== ""}
                  />
                </div>
              </Nav.Item>

              <button type="submit">Search</button>
            </Nav>
          </form>

          {error && <div>Error: {error.message}</div>}
        </div>
        <div className="content">
          <span style={{ display: "inline-block" }}>
            {restaurants.map((restaurant) => (
              <Card
                key={restaurant.name}
                className="res"
                onClick={() => navigatePage(restaurant.name)}
                style={{
                  width: "25rem",
                  display: "inline-block",
                  margin: "5px",
                }}
              >
                <Card.Img
                  src={restaurant.photo}
                  alt={restaurant.name}
                  style={{ height: "300px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title> {restaurant.name}</Card.Title>
                  <Card.Text>
                    <div>City: {restaurant.city}</div>
                    <div>Location: {restaurant.location}</div>
                    <div>Rating: {restaurant.resRating}</div>
                    <div>Opening Time: {restaurant.openingTime}</div>
                    <div>Closing Time: {restaurant.closingTime}</div>
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </span>
        </div>
      </div>
    </>
  );
}

export default Home;
