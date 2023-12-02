import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./restaurant.css"; // Import your CSS file
// import { useNavigate } from "react-router-dom";
// import Nav from "react-bootstrap/Nav";
import { useSelector } from "react-redux";
import { selectUser } from "./redux/userSlice";
import { v4 as uuidv4 } from "uuid";
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
  // Card,
  ToggleButtonGroup as RBToggleButtonGroup,
  ToggleButton as RBToggleButton,
  Modal,
} from "react-bootstrap";
import ListReservationPartnerApp from "./view/partner_app/reservations/ListReservationsPartnerApp";
const ImageService = require("../services/uploadImageService");

function RestaurantAdmin() {
  const user = useSelector(selectUser);
  const location = useLocation();
  // const navigate = useNavigate();
  const [isToggled, setIsToggled] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [restaurantData, setRestaurantData] = useState({
    closingTime: "",
    openingTime: "",
    menuList: [],
    tables: {},
    noOfTables: "",
    isRestaurantOpen: false,
    isFullyBooked: false,
  });

  const id = location.state.id; // Access the data passed from the Home component

  const [Openinghours, setOpeninghours] = useState({
    closingTime: "",
    openingTime: "",
  });

  const [showAlert, setShowAlert] = useState(false);

  const [showOpeninghours, setShowOpeninghours] = useState(true);
  const [showRestaurantStatus, setShowRestaurantStatus] = useState(true);
  const [showFoodMenu, setShowFoodMenu] = useState(true);
  const [showTables, setShowTables] = useState(true);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newFoodItem, setNewFoodItem] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    menu_id: "",
    image: "",
    discount:"",
    availability:false,
  });
  const [newTable, setNewTable] = useState({
    tableSize: "",
    numberOfTables: "",
  });

  useEffect(() => {
    axios
      .get(
        `https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant?id=${id}`
      )
      .then((response) => {
        setRestaurantData(response.data);
        setIsToggled(response.data.available);
        setOpeninghours({
          closingTime: response.data.closingTime,
          openingTime: response.data.openingTime,
        });
      });
  }, [user.id]);

  const handleAddOpeninghours = () => {
    const operation = {
      id: id,
      operation: "availablilty",
      openingTime: Openinghours.openingTime,
      closingTime: Openinghours.closingTime,
    };

    axios
      .post(
        `https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev//edit-partner-detail`,
        operation
      )
      .then(() => {
        setOpeninghours({
          openingTime: Openinghours.openingTime,
          closingTime: Openinghours.closingTime,
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
    // Reset the newFoodItem state
    setNewFoodItem({
      name: "",
      price: "",
      description: "",
      category: "",
      image: "",
      discount: "",
      availability:"",
    });

    // Set the update mode to false
    setIsUpdateMode(false);

    // Show the modal for adding a new food item
    setShowAddFoodModal(true);
  };

  const handleCloseAddFoodModal = () => {
    setShowAddFoodModal(false);
  };

  const handleAddFoodItem = () => {
    alert(selectedImage);
    newFoodItem.image = selectedImage;
    // Validate input
    if (newFoodItem.name.trim() && !isNaN(newFoodItem.price)) {
      const newItem = {
        name: newFoodItem.name,
        price: newFoodItem.price,
        category: newFoodItem.category,
        description: newFoodItem.description,
        menu_id: isUpdateMode ? newFoodItem.menu_id : uuidv4(),
        image: newFoodItem.image,
        discount: newFoodItem.discount,
        availability: newFoodItem.availability,
      };

      if (restaurantData.menuList == null) {
        restaurantData.menuList = "";
      }
      // Update or add the menu item based on the mode
      const updatedMenuList = isUpdateMode
        ? restaurantData.menuList.map((item) =>
            item.menu_id === newItem.menu_id ? newItem : item
          )
        : [...restaurantData.menuList, newItem];

      // Update the menu list in the state
      setRestaurantData((prevData) => ({
        ...prevData,
        menuList: updatedMenuList,
      }));

      const operation = {
        id: id,
        operation: "menu",
        menuList: updatedMenuList,
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
      alert("Invalid input. Please enter a valid name and price.");
    }
  };

  const handleShowAddTableModal = () => {
    setShowAddTableModal(true);
  };

  const handleCloseAddTableModal = () => {
    setShowAddTableModal(false);
  };

  const handleAddTableItem = () => {
    if (restaurantData.tables == null) {
      restaurantData.tables = {};
      restaurantData.noOfTables = parseInt(newTable.numberOfTables);
      restaurantData.tables[newTable.tableSize] = parseInt(
        newTable.numberOfTables
      );
    } else if (!isNaN(newTable.tableSize) && !isNaN(newTable.numberOfTables)) {
      restaurantData.noOfTables -= restaurantData.tables[newTable.tableSize];
      restaurantData.noOfTables += parseInt(newTable.numberOfTables);
      if (!(newTable.tableSize in restaurantData.tables)) {
        // Key doesn't exist, so insert the key-value pair
        restaurantData.tables[newTable.tableSize] = parseInt(
          newTable.numberOfTables
        );
      } else {
        // Key already exists, update the value
        restaurantData.tables[newTable.tableSize] = parseInt(
          newTable.numberOfTables
        );
      }

      const tab = restaurantData.tables;
      console.log(restaurantData.tables);
      console.log(tab);

      const operation = {
        id: id,
        operation: "table",
        tables: tab,
        noOfTables: restaurantData.noOfTables,
      };

      axios
        .post(
          `https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev//edit-partner-detail`,
          operation
        )
        .then(() => {
          handleCloseAddTableModal();
        });
    } else {
      // Handle invalid input
      alert("Invalid input. Please enter a valid input.");
    }
  };

  const handleDeleteFoodItem = (menuId) => {
    // Filter out the item to be deleted
    const updatedMenuList = restaurantData.menuList.filter(
      (item) => item.menu_id !== menuId
    );

    // Update the menu list in the state
    setRestaurantData((prevData) => ({
      ...prevData,
      menuList: updatedMenuList,
    }));

    // Send a request to update the menu list on the server
    const operation = {
      id: id,
      operation: "menu",
      menuList: updatedMenuList,
    };

    axios
      .post(
        `https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev//edit-partner-detail`,
        operation
      )
      .then(() => {
        // Handle success or show a notification
      })
      .catch((error) => {
        // Handle errors
      });
  };

  const handleUpdateFoodItem = (menuId) => {
    // Find the item to be updated
    const itemToUpdate = restaurantData.menuList.find(
      (item) => item.menu_id === menuId
    );

    // Set the values in the state for the modal
    setNewFoodItem({
      name: itemToUpdate.name,
      price: itemToUpdate.price,
      description: itemToUpdate.description,
      category: itemToUpdate.category,
      menu_id: menuId,
      image: itemToUpdate.image,
      discount:itemToUpdate.discount,
      availability: itemToUpdate.availability,
    });

    // Set the update mode to true
    setIsUpdateMode(true);

    // Show the modal for updating the food item
    setShowAddFoodModal(true);
  };

  const handleFileChange = async (e) => {
    try {
      // Update the selected image when the file input changes
      console.log(e.target.files[0]);
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async function (event) {
        try {
          const imageData = reader.result; // Use reader.result instead of e.target.result
          const response = await ImageService.uploadImageData(imageData);
          setSelectedImage(response.data.message);
        } catch (uploadError) {
          // Handle error during image upload
          console.error("Error uploading image:", uploadError);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      // Handle other errors (e.g., if the file is not selected properly)
      console.error("Error handling file change:", error);
    }
  };

  const handleTabSelect = (key) => {
    switch (key) {
      case "Openinghours":
        setShowOpeninghours(true);
        setShowRestaurantStatus(false);
        setShowFoodMenu(false);
        setShowTables(false);
        break;
      case "restaurantStatus":
        setShowOpeninghours(false);
        setShowRestaurantStatus(true);
        setShowFoodMenu(false);
        setShowTables(false);
        break;
      case "foodMenu":
        setShowOpeninghours(false);
        setShowRestaurantStatus(false);
        setShowFoodMenu(true);
        setShowTables(false);
        break;
      case "tables":
        setShowOpeninghours(false);
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
        <Col md={12}>
          <Tabs
            defaultActiveKey="Openinghours"
            onSelect={handleTabSelect}
            id="restaurant-admin-tabs"
          >
            <Tab eventKey="Openinghours" title="Openinghours">
              {showOpeninghours && (
                <>
                  <Form>
                    <Form.Group controlId="formOpeninghoursFrom">
                      <Form.Label>Opening Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={Openinghours.openingTime}
                        onChange={(e) =>
                          setOpeninghours({
                            ...Openinghours,
                            openingTime: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group controlId="formOpeninghoursTo">
                      <Form.Label>Closing Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={Openinghours.closingTime}
                        onChange={(e) =>
                          setOpeninghours({
                            ...Openinghours,
                            closingTime: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                    <Button variant="primary" onClick={handleAddOpeninghours}>
                      Set Openinghours
                    </Button>
                  </Form>
                  {showAlert && (
                    <Alert
                      variant="success"
                      onClose={() => setShowAlert(false)}
                      dismissible
                    >
                      Openinghours added successfully!
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
                        <th>Discount</th>
                        <th>Availability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurantData.menuList &&
                        restaurantData.menuList.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>{item.price}</td>
                            <td>{item.discount}</td>
                            <td>{item.availability ? 'Yes' : 'Out of Stock'}</td>
                            <td>
                              <Button
                                variant="danger"
                                onClick={() =>
                                  handleDeleteFoodItem(item.menu_id)
                                }
                              >
                                Delete
                              </Button>
                            </td>
                            <td>
                              <Button
                                variant="primary"
                                onClick={() =>
                                  handleUpdateFoodItem(item.menu_id)
                                }
                              >
                                Update
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>

                  {/* Add button to trigger the addition of a new food item */}
                  <Button variant="primary" onClick={handleShowAddFoodModal}>
                    Add Food Item
                  </Button>

                  {/* Modal for adding a new food item */}
                  <Modal
                    show={showAddFoodModal}
                    onHide={handleCloseAddFoodModal}
                  >
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
                            onChange={(e) =>
                              setNewFoodItem({
                                ...newFoodItem,
                                name: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                        <Form.Group controlId="formFoodItemPrice">
                          <Form.Label>Item Price</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter item price"
                            value={newFoodItem.price}
                            onChange={(e) =>
                              setNewFoodItem({
                                ...newFoodItem,
                                price: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                        <Form.Group controlId="formFoodItemDescription">
                          <Form.Label>Item Description</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter item description"
                            value={newFoodItem.description}
                            onChange={(e) =>
                              setNewFoodItem({
                                ...newFoodItem,
                                description: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                        <Form.Group controlId="formFoodItemCategory">
                          <Form.Label>Item Category</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter item category"
                            value={newFoodItem.category}
                            onChange={(e) =>
                              setNewFoodItem({
                                ...newFoodItem,
                                category: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                        {/* Add the file input for image upload */}
                        <Form.Group controlId="formFoodItemImage">
                          <Form.Label>Item Image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="formFoodItemDiscount">
                          <Form.Label>Item Discount</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter item discount percentage"
                            value={newFoodItem.discount}
                            onChange={(e) =>
                              setNewFoodItem({
                                ...newFoodItem,
                                discount: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                        <Form.Group controlId="formFoodItemAvailability">
                          <Form.Label>Item Availability</Form.Label>
                          <Form.Check
                            type="checkbox"
                            label="Available"
                            checked={newFoodItem.availability}
                            onChange={(e) =>
                              setNewFoodItem({
                                ...newFoodItem,
                                availability: e.target.checked,
                              })
                            }
                          />
                        </Form.Group>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button 
                        variant="secondary"
                        onClick={handleCloseAddFoodModal}
                      >
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
                        <th>Table-Number</th>
                        <th>Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurantData.tables &&
                        Object.entries(restaurantData.tables).map(
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
                  {/* Add button to trigger the addition of a new food item */}
                  <Button variant="primary" onClick={handleShowAddTableModal}>
                    Update Tables
                  </Button>

                  {/* Modal for adding a new food item */}
                  <Modal
                    show={showAddTableModal}
                    onHide={handleCloseAddTableModal}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Add Tables</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Group controlId="formTableCapacity">
                          <Form.Label>Seating Capacity of Table</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter seating Capacity of table"
                            value={newTable.tableSize}
                            onChange={(e) =>
                              setNewTable({
                                ...newTable,
                                tableSize: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                        <Form.Group controlId="formTableNumbers">
                          <Form.Label>
                            No. of Tables for the above mentioned seating
                            capacity
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter no. of tables"
                            value={newTable.numberOfTables}
                            onChange={(e) =>
                              setNewTable({
                                ...newTable,
                                numberOfTables: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        variant="secondary"
                        onClick={handleCloseAddTableModal}
                      >
                        Close
                      </Button>
                      <Button variant="primary" onClick={handleAddTableItem}>
                        Update Tables
                      </Button>
                    </Modal.Footer>
                  </Modal>
                  <p>Number of Tables: {restaurantData.noOfTables}</p>
                </>
              )}
            </Tab>
            <Tab eventKey="reservations" title="Reservations">
              { restaurantData?.name && <ListReservationPartnerApp restaurantName={restaurantData?.name} />}
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

export default RestaurantAdmin;
