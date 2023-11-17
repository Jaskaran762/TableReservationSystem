import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./restaurant.css"; // Import your CSS file
import { useNavigate } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import { useSelector } from "react-redux";
import { selectUser } from "./redux/userSlice";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Alert,
  Tab,
  Tabs,
  Card,
  ToggleButtonGroup as RBToggleButtonGroup,
  ToggleButton as RBToggleButton,
  Modal
} from "react-bootstrap";

function RestaurantAdmin() {
  const user = useSelector(selectUser);
  const location = useLocation();
  const navigate = useNavigate();
  const [isToggled, setIsToggled] = useState(false);
  const id = 1;

  const [restaurantData, setRestaurantData] = useState({
    closingTime: "",
    openingTime: "",
    menuList: [],
    tables: {},
    noOfTables: "",
    isRestaurantOpen: false,
    isFullyBooked: false,
  });

  const [availability, setAvailability] = useState({
    closingTime: "",
    openingTime: "",
  });

  const [showAlert, setShowAlert] = useState(false);

  const [showAvailability, setShowAvailability] = useState(true);
  const [showRestaurantStatus, setShowRestaurantStatus] = useState(true);
  const [showFoodMenu, setShowFoodMenu] = useState(true);
  const [showTables, setShowTables] = useState(true);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [newFoodItem, setNewFoodItem] = useState({ name: '', price: '', description: '', category: '' });

  useEffect(() => {
    axios
      .get(
        `https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant?id=${id}`
      )
      .then((response) => {
        setRestaurantData(response.data);
        setIsToggled(response.data.available);
        setAvailability({
          closingTime: response.data.closingTime,
          openingTime: response.data.openingTime,
        });
      });
  }, [user.id]);

  const handleAddAvailability = () => {
    const operation = {
      id: id,
      operation: "availablilty",
      openingTime: availability.openingTime,
      closingTime: availability.closingTime,
    };

    axios
      .post(
        `https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev//edit-partner-detail`,
        operation
      )
      .then(() => {
        setAvailability({
          openingTime: availability.openingTime,
          closingTime: availability.closingTime,
        });
        setShowAlert(true);
      });
  };

  const handleToggle = () => {
    const operation = {
      id: id,
      operation: "status",
      available: !isToggled,
    };

    axios
      .post(
        `https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev//edit-partner-detail`,
        operation
      )
      .then(() => {
        setIsToggled(!isToggled);
      });
  };

  const handleShowAddFoodModal = () => {
    setShowAddFoodModal(true);
  };

  const handleCloseAddFoodModal = () => {
    setShowAddFoodModal(false);
  };

  const handleAddFoodItem = () => {
    // Validate input
    if (newFoodItem.name.trim() && !isNaN(newFoodItem.price)) {
      const newItem = {
        name: newFoodItem.name,
        price: newFoodItem.price,
        category: newFoodItem.category,
        description: newFoodItem.description,
        menu_id: restaurantData.menuList.length
      };

      // Update the menu list
      setRestaurantData((prevData) => ({
        ...prevData,
        menuList: [...prevData.menuList, newItem],
      }));

      const operation = {
        id: id,
        operation: "menu",
        menuList: [...restaurantData.menuList, newItem]
      };
      axios
        .post(
          `https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev//edit-partner-detail`,
          operation
        )
        .then(() => {
            handleCloseAddFoodModal();
        });

    } else {
      // Handle invalid input
      alert('Invalid input. Please enter a valid name and price.');
    }
  };

  const handleTabSelect = (key) => {
    switch (key) {
      case "availability":
        setShowAvailability(true);
        setShowRestaurantStatus(false);
        setShowFoodMenu(false);
        setShowTables(false);
        break;
      case "restaurantStatus":
        setShowAvailability(false);
        setShowRestaurantStatus(true);
        setShowFoodMenu(false);
        setShowTables(false);
        break;
      case "foodMenu":
        setShowAvailability(false);
        setShowRestaurantStatus(false);
        setShowFoodMenu(true);
        setShowTables(false);
        break;
      case "tables":
        setShowAvailability(false);
        setShowRestaurantStatus(false);
        setShowFoodMenu(false);
        setShowTables(true);
        break;
      default:
        break;
    }
  };

  return (
    <Container>
      {restaurantData && (
        <div>
          <h2>{restaurantData.name}</h2>
          <img
            src={restaurantData.photo}
            alt={`${restaurantData.name} Photo`}
          />
        </div>
      )}
      <Row>
        <Col md={3}>
          <Tabs
            defaultActiveKey="availability"
            onSelect={handleTabSelect}
            id="restaurant-admin-tabs"
          >
            <Tab eventKey="availability" title="Availability">
              {showAvailability && (
                <>
                  <Form>
                    <Form.Group controlId="formAvailabilityFrom">
                      <Form.Label>Opening Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={availability.openingTime}
                        onChange={(e) =>
                          setAvailability({
                            ...availability,
                            openingTime: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group controlId="formAvailabilityTo">
                      <Form.Label>Closing Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={availability.closingTime}
                        onChange={(e) =>
                          setAvailability({
                            ...availability,
                            closingTime: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                    <Button variant="primary" onClick={handleAddAvailability}>
                      Set Availability
                    </Button>
                  </Form>
                  {showAlert && (
                    <Alert
                      variant="success"
                      onClose={() => setShowAlert(false)}
                      dismissible
                    >
                      Availability added successfully!
                    </Alert>
                  )}
                </>
              )}
            </Tab>
            <Tab eventKey="restaurantStatus" title="Restaurant Status">
              {showRestaurantStatus && (
                <>
                  <RBToggleButtonGroup type="checkbox" className="mb-2">
                    <RBToggleButton
                      id="toggle-button"
                      type="checkbox"
                      variant={isToggled ? "success" : "danger"}
                      value="1"
                      onChange={handleToggle}
                    >
                      {isToggled ? "Open" : "Closed"}
                    </RBToggleButton>
                  </RBToggleButtonGroup>
                  <p>Click to change status</p>
                </>
              )}
            </Tab>
            <Tab eventKey="foodMenu" title="Food Menu">
            {showFoodMenu && (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {restaurantData.menuList.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {/* Add button to trigger the addition of a new food item */}
          <Button variant="primary" onClick={handleShowAddFoodModal}>
            Add Food Item
          </Button>

          {/* Modal for adding a new food item */}
          <Modal show={showAddFoodModal} onHide={handleCloseAddFoodModal}>
            <Modal.Header closeButton>
              <Modal.Title>Add Food Item</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formFoodItemName">
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter item name"
                    value={newFoodItem.name}
                    onChange={(e) => setNewFoodItem({ ...newFoodItem, name: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="formFoodItemPrice">
                  <Form.Label>Item Price</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter item price"
                    value={newFoodItem.price}
                    onChange={(e) => setNewFoodItem({ ...newFoodItem, price: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="formFoodItemDescription">
                  <Form.Label>Item Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter item description"
                    value={newFoodItem.description}
                    onChange={(e) => setNewFoodItem({ ...newFoodItem, description: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="formFoodItemCategory">
                  <Form.Label>Item Category</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter item category"
                    value={newFoodItem.category}
                    onChange={(e) => setNewFoodItem({ ...newFoodItem, category: e.target.value })}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseAddFoodModal}>
                Close
              </Button>
              <Button variant="primary" onClick={handleAddFoodItem}>
                Add Food Item
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Tab>
            <Tab eventKey="tables" title="Tables">
              {showTables && (
                <>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Seating Capacity (Seats per table)</th>
                        <th>Available Tables</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(restaurantData.tables).map(
                        ([seatingCapacity, tableNumber], index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{seatingCapacity}</td>
                            <td>{tableNumber}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </Table>
                  <p>Number of Tables: {restaurantData.noOfTables}</p>
                </>
              )}
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

export default RestaurantAdmin;
