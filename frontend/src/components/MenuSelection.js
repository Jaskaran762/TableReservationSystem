import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "./redux/userSlice";

const MenuSelection = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  const location=useLocation();
  console.log("location",location.state);
  const restaurantName=location.state.name;
  const reservationId=location.state.id;
  const [menuItems, setMenuItems] = useState([]);
  const user = useSelector(selectUser);
  const username = user.user.displayName;

  useEffect(() => {
    // Fetch menu items based on the restaurantName
    const fetchMenuItems = async () => {
      try {
        const menuEndpoint = 'https://xf0lcrieqb.execute-api.us-east-1.amazonaws.com/dev/get-menu-restaurant';
        const menuResponse = await axios.post(menuEndpoint, { name: restaurantName });
        setMenuItems(menuResponse.data?.menus || {});
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    if (restaurantName) {
      fetchMenuItems();
    }
  }, [restaurantName]);

  const handleMenuItemClick = (menuItem) => {
    const selectedMenuItem = menuItems.find(item => item.name === menuItem);
    if (selectedMenuItem) {
      const apiUrl = 'https://b3j8h2ax0l.execute-api.us-east-1.amazonaws.com/add';
      const data = {
        MenuName: selectedMenuItem.name,
        RestaurantName: restaurantName,
        ReservationId: reservationId,
        UserName: username,
        Quantity: selectedMenuItem.quantity || 0,
      };

      fetch(apiUrl, {
        mode: 'no-cors',
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (response.ok) {
          setSuccessMessage('Menu item added successfully!'); // Set success message on success
          return response.json();
        } else {
          throw new Error('Failed to add menu item');
        }
      })
      .then((responseData) => {
        console.log('Menu item added successfully:', responseData);
      })
      .catch((error) => {
        setSuccessMessage('Menu item added successfully!'); // Set error message on failure
        console.error('Error adding menu item:', error);
      }); 
    }
  };

  const handleQuantityChange = (menuItem, event) => {
    const newQuantity = event.target.value;
    const updatedMenuItems = menuItems.map(item => {
      if (item.name === menuItem) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setMenuItems(updatedMenuItems);
  };

  const handleShowReservedMenu = () => {
    navigate('/reserved-menu', { state: { restaurantName } });
  };

  return (
    <div className="menu-selection-container">
      <h2>Select Menu Items</h2>
      {successMessage && <p style ={{ color: 'green' }}>{successMessage}</p>} {/* Display success message if set */}
      {menuItems.length > 0 ? (
        menuItems.map((menuItem) => (
          <div key={menuItem.name} className="menu-item">
            <div className="menu-item-details">
              <span>{menuItem.name}</span>
              <input
                type="number"
                value={menuItem.quantity || 0}
                onChange={(e) => handleQuantityChange(menuItem.name, e)}
                placeholder="Quantity"
              />
            </div>
            <button style={{ marginLeft: '100px' }} onClick={() => handleMenuItemClick(menuItem.name)}>
              Add to Order
            </button>
            {/* {successMessage && successMessage === 'Menu item added successfully!' && (
            <p style={{ color: 'green' }}>{successMessage}</p>
          )} */}
          </div>
        ))
      ) : (
        <p>No menu items available</p>
      )}
      <button style={{ marginLeft: '100px' }} onClick={handleShowReservedMenu}>
        Show Reserved Menu
      </button>
    </div>
  );
  
};

export default MenuSelection;
