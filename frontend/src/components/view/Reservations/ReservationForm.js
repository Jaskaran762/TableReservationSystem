import {React, useEffect, useState} from 'react';
import {navigate, useLocation, useNavigate, useParams} from "react-router-dom";
import SlotButton from "../UtilComponents/SlotButton";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import {auth} from "../../../config/firebase";
import {fetchRestaurantFullDetails} from "../../../services/RestaurantService";
import TableButton from "../UtilComponents/tableButton";
import {toast} from "react-toastify";
const RestaurantService = require("../../../services/RestaurantService");
const ReservationService = require("../../../services/ReservationService");
function ReservationForm() {
    const {search,state} = useLocation();
    const searchParams = new URLSearchParams(search);
    const {restaurantId} = useParams();
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedTable, setSelectedTable] = useState();
    const [tables, setTables] = useState({});
    const [selectedSlot, setSelectedSlot] = useState({});
    const [isOwner,setOwner] = useState(false);
    const navigate = useNavigate();

    const [restaurantData,setRestaurantData] = useState({});
    console.log("state->");
    console.log(state);
    console.log(searchParams);
    console.log("rest->"+restaurantId);
    const [formData, setFormData] = useState({
        userId: auth?.currentUser?.email,
        // restaurantId: '',
        // date: '',
        isAcceptedByRestaurant: false,
        numberOfPerson: 0,
        isDeleted: false,
        // timeSlot:{
        //     start:"16:00",
        //     end: "23:00"
        // }
    });

    const isReadOnly = () => {

    }
    // const navigateToReservations = (event,restaurantId)=>{
    //     event.preventDefault();
    //     navigate(`/restaurants`);
    // }

    useEffect(()=>{
        fetchAvailableSlots(formData,selectedTable);
    },[selectedTable]);
    useEffect(()=>{
        const fetchData = async ()=>{
            const restaurantDataRespose = await RestaurantService.fetchRestaurantData(restaurantId);
            let newRestaurantData ;
            if (restaurantDataRespose.data["restaurants"].length > 0) {
                if (Object.keys(restaurantData).length === 0) {
                    setRestaurantData(restaurantDataRespose.data["restaurants"][0]);
                    newRestaurantData = restaurantDataRespose.data["restaurants"][0];
                    console.log("new RestaurantData->"+newRestaurantData);
                }
            }
            console.log("New RestaurantData->"+newRestaurantData);
            if(tables != {} && newRestaurantData){
                const restaurantFullData = await  RestaurantService.fetchRestaurantFullDetails(newRestaurantData.id);
                console.log("tableData");
                console.log("Restaurant Full Data->"+restaurantFullData);
                console.log(JSON.stringify(restaurantFullData));
                console.log("restaurantDataRespose.data[\"tables\"]"+restaurantFullData.data);
                if (restaurantFullData.data["tables"] && Object.keys(restaurantFullData.data["tables"]).length>0){
                    setTables(restaurantFullData.data["tables"]);
                    console.log("Tables-> "+restaurantFullData.data["tables"]);
                }
            }
                if(searchParams.has("isUpdate")){
                    //fetch the reservation data and assign to current
                    const reservationDetails = await ReservationService.fetchReservation(searchParams.get("reservationId"));

                        console.log("currentReservationData->"+JSON.stringify(reservationDetails));
                        if( formData.numberOfPerson === 0 && !formData.hasOwnProperty("timeSlot") && !formData.hasOwnProperty("date") && !formData.hasOwnProperty("tableName")  ){
                            setFormData({
                                ...formData,
                                userId: reservationDetails.userId,
                                timeSlot: reservationDetails.timeSlot
                                ,date: reservationDetails.date
                                ,numberOfPerson:reservationDetails.numberOfPerson
                                ,tableName: reservationDetails.tableName
                            });
                            fetchAvailableSlotsNew({
                                ...formData,
                                tableName: reservationDetails.tableName,
                                timeSlot: reservationDetails.timeSlot
                                ,date: reservationDetails.date
                                ,numberOfPerson:reservationDetails.numberOfPerson
                            },newRestaurantData);

                            setSelectedSlot(reservationDetails.timeSlot);
                            setSelectedTable(reservationDetails.tableName);
                        }

                }
        }
        fetchData();
    },[formData])

    const isValidForm = (formData, selectedTable, selectedSlot) => {
        const errors = {};

        if (!formData.numberOfPerson || formData.numberOfPerson <= 0) {
            errors.numberOfPerson = 'Number of persons must be greater than 0';
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const selectedDate = new Date(formData.date);
        if (!formData.date || selectedDate <= yesterday) {
            errors.date = 'Date must be greater than yesterday';
        }

        if (!selectedTable || Object.keys(selectedTable).length === 0) {
            errors.selectedTable = 'Please select a table';
        }
        if(tables[selectedTable]<formData.numberOfPerson){
            errors.numberOfPerson = 'Number of Person can\'t be greater than table size.';
        }
        if (!selectedSlot || Object.keys(selectedSlot).length === 0) {
            errors.selectedSlot = 'Please select a time slot';
        }
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((error) => {
                toast.error(error);
            });
        }
        return Object.keys(errors).length > 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);

        setFormData({
            ...formData,
            [name]: inputValue,
        });
        console.log("change in->"+ name);
        console.log("change->"+ JSON.stringify(formData));
        // if(name == "table"){
        //
        // }
        // if(name === "date" || name === "tableName"){
        //     fetchAvailableSlots({
        //         ...formData,
        //         [name]: inputValue,
        //     },inputValue);
        // }
    }
    const handleTableSelect = (event,tableName) => {
        console.log("TableName=>"+JSON.stringify(tableName));
        handleInputChange(event)
        setFormData({
            ...formData,
            tableName: tableName,
        });
        setSelectedTable(tableName);
    };

    const handleSlotSelect = (event,slot) => {
        console.log("slot=>"+JSON.stringify(slot));
        handleInputChange(event)
        setFormData({
            ...formData,
            timeSlot: slot,
        });
        setSelectedSlot(slot);
    };

    const fetchRestaurantTables = (restaurantId) =>{
        RestaurantService.fetchRestaurantFullDetails(restaurantId)
            .then(value => {
                console.log("Fetched Restaurant Full Data : "+value);
                console.log(JSON.stringify(value));
                setTables(value.tables);
            })
    }
    const fetchAvailableSlotsNew = (data,restaurantData)=>{
        console.log("fetchAvailablSlots New->has been called!");
        console.log(restaurantData);
        if( data.tableName !=undefined && data.date!=undefined && data.date!=""){
            ReservationService.fetchAvailableSlots(data.date, restaurantData.openingTime, restaurantData.closingTime, restaurantData.name,data.tableName)
                .then(value => {
                    const slots = value.data;
                    setTimeSlots(slots); // Fix this line
                    console.log("slots-> "+ JSON.stringify(slots[0]===slots[0]));
                })
                .catch(error => {
                    console.error('Error fetching available slots:', error);
                });
        }
    }
    const fetchAvailableSlots = (data)=>{
        console.log("fetchAvailablSlots->has been called!");
        console.log(data);
        if(data.tableName !=undefined && data.date!=undefined && data.date!=""){
            ReservationService.fetchAvailableSlots(data.date, restaurantData.openingTime, restaurantData.closingTime, restaurantId,selectedTable)
                .then(value => {
                    const slots = value.data;
                    setTimeSlots(slots); // Fix this line
                    console.log("slots-> "+ JSON.stringify(slots[0]===slots[0]));
                })
                .catch(error => {
                    console.error('Error fetching available slots:', error);
                });
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        console.log("formData->"+JSON.stringify(formData));
        // if(formData.numberOfPerson)
        try {
            formData.restaurantId = restaurantData.name;

            console.log("Selected Slot at parent!->"+JSON.stringify(selectedSlot));

            if (!isValidForm(formData,selectedTable,selectedSlot)){
                const response = await ReservationService.updateReservation(searchParams.get("reservationId"),formData);
                if (response.status === 200) {
                    toast.success('Reservation updated!', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    navigate("/reservations");
                    console.log("Reservation updated!");

                } else {
                    toast.error('Failed to update reservation!', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    console.error('Failed to update reservation');
                }
            }


        } catch (error) {
            toast.error('Failed to create Reservation!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // console.log("FormData: "+JSON.stringify());
            formData.restaurantId = restaurantData.name;
            if(!isValidForm(formData,selectedTable,selectedSlot)){
                const response = await ReservationService.createReservation(formData);
                if (response.status === 201) {
                    toast.success('Reservation Saved!', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    console.log("Reservation Saved!");
                    navigate("/reservations");
                } else {
                    toast.error('Failed to create Reservation!', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                }
            }

        } catch (error) {
            toast.error('Failed to create Reservation!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            console.error('Error:', error);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100" >
            <Form onSubmit={searchParams.has("isUpdate") ? handleUpdate:handleSubmit}>
                <Form.Group as={Row} className="mb-3" >
                    <Form.Label column sm="6">
                        Number of Persons:
                    </Form.Label>
                    <Col sm="6">
                        <Form.Control
                            type="number"
                            name="numberOfPerson"
                            value={formData.numberOfPerson}
                            onChange={handleInputChange}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" >
                    <Form.Label column sm="6">
                        Date:
                    </Form.Label>
                    <Col sm="6">
                        <Form.Control
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                        />
                    </Col>
                </Form.Group>
                        {tables && <TableButton data={tables} selectedTable={selectedTable} onButtonSelect={handleTableSelect} />}
                        {formData.date && formData.tableName && <SlotButton data= {timeSlots} selectedSlot={selectedSlot} onSlotSelect={handleSlotSelect}/>}
                <Button type="submit" > {searchParams.has("isUpdate") ? "Update Reservation":"Create Reservation"}</Button>
            </Form>
        </Container>
    );


}

export default ReservationForm;
