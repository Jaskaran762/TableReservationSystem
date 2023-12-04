import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./restaurant.css"; // Import your CSS file
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "./redux/userSlice";

function Restaurant() {
  const navigate = useNavigate();
  // const navigateToMenuReservation = () => {
  //   console.log("restaurantName",restaurantName);
  //   navigate("/menu-selection", { state: { name: restaurantName } });
  // };
  const [restaurantInfo, setRestaurantInfo] = useState({});
  const [res, setRes] = useState({});
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  // const [setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const data = location.state.name; // Access the data passed from the Home component
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

        console.log(infoResponse);
        setRestaurantInfo(infoResponse.data?.restaurants);
        setRes(infoResponse.data?.restaurants[0] || {}); 
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

  const user = useSelector(selectUser);
  const username = user.user.displayName;
  const navigateToReservation = (event,restaurantId)=>{
    event.preventDefault();
    navigate(`/restaurants/${restaurantId}/createReservation`);
  }
  const handleAddReview = async (newReview, newRating) => {
    try {
      const addReviewEndpoint =
        "https://ch0bs0q5ek.execute-api.us-east-1.amazonaws.com/dev/add-review-restaurant";
      await axios.post(addReviewEndpoint, {
        name: restaurantName,
        description: newReview,
        rating: newRating,
        author: username,
      });
      alert("Review added successfully");
      // After adding the review, fetch the updated reviews
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div>
      {res && (
        <div>
          <h2>{res.name}</h2>
          <img src={res.photo} alt={`${res.name} Photo`} />
          <p>Location: {res.location}</p>
          <p>City: {res.city}</p>
        </div>
      )}
      <button type="submit" onClick={ event =>  navigateToReservation(event,res.name)} >Create Reservation</button>
      <h2>Menu</h2>
      <div className="card-container">
      {menu
        ?.filter((menuItem) => menuItem.availability)
        .map((menuItem, index) => (
          <div key={index} className="card">
            <p>Name: {menuItem.name}</p>
            <p>Price: {menuItem.price}</p>
            {/* <button onClick={() => navigateToMenuReservation(res.name)}> */}
              <img src={menuItem.image} alt={`Item ${index}`} />
            {/* </button> */}
            <p>Price: {menuItem.price}</p>
            {menuItem.discount && <p>Discount: {menuItem.discount}</p>}
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
          const newRating = e.target.elements.rating.value;
          if (newReview.trim() !== "") {
            handleAddReview(newReview,newRating);
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
        <label for="numberDropdown">Rating:</label>
        <select id="numberDropdown" name="rating">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <br /><br />
        <button type="submit">Submit Review</button>
      </form>

      {error && <div>Error: {error.message}</div>}
    </div>
  );
}

export default Restaurant;
