import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import { useSelector } from "react-redux";
import { selectUser } from "./redux/userSlice";

const ReservedMenuPage = () => {
  const [reservedMenu, setReservedMenu] = useState([]);
  const [isFetchingReservedMenu, setIsFetchingReservedMenu] = useState(false);
  const [dataUpdated, setDataUpdated] = useState(false); // New state variable
  const [restaurantName, setRestaurantName] = useState('');

  const navigate = useNavigate();
  const location = useLocation(); // Import useLocation from react-router-dom
  const user = useSelector(selectUser);
  const username = user.user.displayName;

  useEffect(() => {
    // Fetch reserved menu items when the component mounts
    const reservedMenuApiUrl = 'https://b3j8h2ax0l.execute-api.us-east-1.amazonaws.com/getmenu';
    const { state } = location;

    if (state && state.restaurantName) {
      setRestaurantName(state.restaurantName);
    }

    setIsFetchingReservedMenu(true);

    fetch(reservedMenuApiUrl)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch reserved menu items');
        }
      })
      .then((responseData) => {
        setReservedMenu(responseData);
        setIsFetchingReservedMenu(false);
      })
      .catch((error) => {
        console.error('Error fetching reserved menu items:', error);
      });
  }, [dataUpdated, location]); // Include dataUpdated in the dependency array

  // Function to handle the update button click for the entire page
  const handleUpdateClick = () => {
    // Implement the update logic for the entire page here
    //update will happen before 1hr of reserved time
    //update button will disappear from the web page if time left is less than 1hr
    console.log('Update button clicked for the entire page'); 
    navigate('/menu-selection',{ state: { name: restaurantName } } );
  };

  const handleDeleteClick = (menuItem) => {
    console.log('This is delete button');
    const apiUrl = 'https://b3j8h2ax0l.execute-api.us-east-1.amazonaws.com/deletemenu';

    const data = {
      MenuName: menuItem,
      UserName: username,
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
            setDataUpdated(!dataUpdated); //to rerender the page after deletion
          return response.json();
        } else {
            setDataUpdated(!dataUpdated); //to rerender the page
          throw new Error('Failed to delete menu item');
        }
      })
      .then((responseData) => {
        console.log('Menu item deleted successfully:', responseData);
        setDataUpdated(!dataUpdated); // Update the state to trigger re-render
      })
      .catch((error) => {
        console.error('Error deleting menu item:', error);
      });
  };

  return (
    <div>
      <h2>Reserved Menu Items</h2>
      {/* <h2>Reserved Menu Items for {restaurantName}</h2> */}
      {isFetchingReservedMenu ? (
        <p>Loading reserved menu items...</p>
      ) : (     
        <ul>
          {reservedMenu.map((item) => (
            <li key={item.MenuName?.S} style={{ marginBottom: '10px' }}>
            {item.MenuName?.S} - Quantity: {item.Quantity?.N}
              <div>
                <button onClick={() => handleDeleteClick(item.MenuName.S)} style={{ marginLeft: '10px' }}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ textAlign: 'center' }}>
        <button onClick={handleUpdateClick}>Update</button>
      </div>
    </div>
  );
};

export default ReservedMenuPage;
