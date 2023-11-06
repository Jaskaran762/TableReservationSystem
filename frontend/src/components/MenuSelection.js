import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MenuSelection = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState({
    pizza: { quantity: 0 },
    pasta: { quantity: 0 },
    burger: { quantity: 0 },
    // Add more menu items as needed
  });

  const handleMenuItemClick = (menuItem) => {
    const quantity = menuItems[menuItem].quantity;
    const apiUrl = 'https://b3j8h2ax0l.execute-api.us-east-1.amazonaws.com/add';

    const data = {
      MenuName: menuItem,
      ReservId: '101',
      UserId: '1',
      Quantity: quantity,
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
          return response.json();
        } else {
          throw new Error('Failed to add menu item');
        }
      })
      .then((responseData) => {
        console.log('Menu item added successfully:', responseData);
      })
      .catch((error) => {
        console.error('Error adding menu item:', error);
      });
  };

  const handleQuantityChange = (menuItem, event) => {
    const newQuantity = event.target.value;
    setMenuItems((prevMenuItems) => ({
      ...prevMenuItems,
      [menuItem]: { quantity: newQuantity },
    }));
  };

  const handleShowReservedMenu = () => {
    navigate('/reserved-menu');
  };

  return (
    <div className="menu-selection-container">
      <h2>Select Menu Items</h2>
      {Object.keys(menuItems).map((menuItem) => (
        <div key={menuItem} className="menu-item">
          <div className="menu-item-details">
            <span>{menuItem}</span>
            <input
              type="number"
              value={menuItems[menuItem].quantity}
              onChange={(e) => handleQuantityChange(menuItem, e)}
              placeholder="Quantity"
            />
          </div>
          <button style={{ marginLeft: '100px' }} onClick={() => handleMenuItemClick(menuItem)}>Add to Order</button>
        </div>
      ))}
      <button style={{ marginLeft: '100px' }} onClick={handleShowReservedMenu}>Show Reserved Menu</button>
    </div>
  );
};

export default MenuSelection;
