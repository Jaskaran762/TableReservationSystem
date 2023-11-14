import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./restaurant.css"; // Import your CSS file
import { useNavigate } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';

function Restaurant() {
  const navigate = useNavigate();
  const navigateToMenuReservation = () => {
    navigate('/menu-selection');
  };
  const [restaurantInfo, setRestaurantInfo] = useState({});
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  // const [setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const data = location.state.data; // Access the data passed from the Home component

  // Now you can use the 'data' variable, which contains the name
  const restaurantName = data;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);

        const infoEndpoint =
          "https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant";
        const menuEndpoint =
          "https://xf0lcrieqb.execute-api.us-east-1.amazonaws.com/dev/get-menu-restaurant";
        const reviewsEndpoint =
          "https://wgfb53q6ie.execute-api.us-east-1.amazonaws.com/dev/get-review-restaturant";

        const [infoResponse, menuResponse, reviewsResponse] = await Promise.all(
          [
            axios.post(infoEndpoint, { name: restaurantName }),
            axios.post(menuEndpoint, { name: restaurantName }),
            axios.post(reviewsEndpoint, { name: restaurantName }),
          ]
        );

        console.log(menuResponse);
        setRestaurantInfo(infoResponse.data);
        //alert(JSON.stringify(menuResponse.data?.menus));
        setMenu(menuResponse.data?.menus);
        setReviews(reviewsResponse.data?.reviews || []);

        console.log(menuResponse.data?.menus);
      } catch (error) {
        setError(error);
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, [restaurantName]);

  const handleAddReview = async (newReview) => {
    try {
      const addReviewEndpoint =
        "https://ch0bs0q5ek.execute-api.us-east-1.amazonaws.com/dev/add-review-restaurant";
      await axios.post(addReviewEndpoint, {
        name: restaurantName,
        description: newReview,
        rating: "3",
        author: "Omm",
      });
      // After adding the review, fetch the updated reviews
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div>
      <h1>{restaurantInfo.name}</h1>
      <p>Location: {restaurantInfo.location}</p>
      <p>Rating: {restaurantInfo.rating}</p>

      <h2>Menu</h2>
      <div className="card-container">
        {menu?.map((menuItem, index) => (
          <div key={index} className="card">
            <p>Name: {menuItem.name}</p>
            <button onClick={navigateToMenuReservation}>
            <img src={menuItem.image} alt={`Item ${index}`} />
            </button>          
            </div>
        ))}
      </div>

      <h2>Reviews</h2>
      <div className="card-container">
        {reviews?.map((reviewItem, index) => (
          <div key={index} className="card">
            <p>Rating: {reviewItem.rating}</p>
            <p>Description: {reviewItem.description} </p>
            <p>Author: {reviewItem.author} </p>
          </div>
        ))}
      </div>

      <h2>Add a Review</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const newReview = e.target.elements.review.value;
          if (newReview.trim() !== "") {
            handleAddReview(newReview);
          }
        }}
      >
        <textarea
          name="review"
          rows="4"
          cols="50"
          placeholder="Write your review..."
        />
        <br />
        <button type="submit">Submit Review</button>
      </form>

      {error && <div>Error: {error.message}</div>}
    </div>
  );
}

export default Restaurant;
