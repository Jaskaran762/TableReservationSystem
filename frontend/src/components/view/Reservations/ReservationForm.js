import {React, useEffect, useState} from 'react';
import {useLocation,useParams} from "react-router-dom";
import SlotButton from "../../SlotButton";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import {auth} from "../../../config/firebase";
const RestaurantService = require("../../../services/RestaurantService");
const ReservationService = require("../../../services/ReservationService");
function ReservationForm() {
    const {search,state} = useLocation();
    const searchParams = new URLSearchParams(search);
    const {restaurantId} = useParams();
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState({});

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

    useEffect(()=>{
        const fetchData = async ()=>{
            const restaurantDataRespose = await RestaurantService.fetchRestaurantData(restaurantId);
            let newRestaurantData ;
            if (restaurantDataRespose.data["restaurants"].length > 0) {
                            if (Object.keys(restaurantData).length === 0) {
                                setRestaurantData(restaurantDataRespose.data["restaurants"][0]);
                                newRestaurantData = restaurantDataRespose.data["restaurants"][0];
                            }
            }
            console.log("new RestaurantData->"+newRestaurantData);
                if(searchParams.has("isUpdate")){
                    //fetch the reservation data and assign to current
                    const reservationDetails = await ReservationService.fetchReservation(searchParams.get("reservationId"));

                        console.log("currentReservationData->");
                        // console.log(JSON.stringify(r));
                        if( formData.numberOfPerson === 0 && !formData.hasOwnProperty("timeSlot") && !formData.hasOwnProperty("date") ){
                            setFormData({
                                ...formData,
                                timeSlot: reservationDetails.timeSlot
                                ,date: reservationDetails.date
                                ,numberOfPerson:reservationDetails.numberOfPerson
                            });

                            fetchAvailableSlotsNew({
                                ...formData,
                                timeSlot: reservationDetails.timeSlot
                                ,date: reservationDetails.date
                                ,numberOfPerson:reservationDetails.numberOfPerson
                            },newRestaurantData);
                            setSelectedSlot(reservationDetails.timeSlot);
                        }

                }
        }
        fetchData();
    },[formData])


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);

        setFormData({
            ...formData,
            [name]: inputValue,
        });
        console.log("change in->"+ name);
        console.log("change->"+ JSON.stringify(formData));
        if(name === "date"){
            fetchAvailableSlots({
                ...formData,
                [name]: inputValue,
            });
        }
    }

    const handleSlotSelect = (event,slot) => {
        console.log("slot=>"+JSON.stringify(slot));
        handleInputChange(event)
        setFormData({
            ...formData,
            timeSlot: slot,
        });
        setSelectedSlot(slot);
    };
    const fetchAvailableSlotsNew = (data,restaurantData)=>{
        console.log("fetchAvailablSlots->has been called!");
        console.log(restaurantData);
        if( data.date!=undefined && data.date!=""){
            ReservationService.fetchAvailableSlots(data.date, restaurantData.openingTime, restaurantData.closingTime, restaurantData.name)
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
        if( data.date!=undefined && data.date!=""){
            ReservationService.fetchAvailableSlots(data.date, restaurantData.openingTime, restaurantData.closingTime, data.restaurantId)
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
        try {
            formData.restaurantId = restaurantData.name;

            console.log("Selected Slot at parent!->"+JSON.stringify(selectedSlot));

            const response = await ReservationService.updateReservation(searchParams.get("reservationId"),formData).then((response)=>{
                console.log(response);
                // Todo: navigate to reservation booking page.
            });
            if (response.status === 200) {
                console.log("Reservation updated!");
                // Reservation was successfully created
            } else {
                console.error('Failed to update reservation');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("formData->"+JSON.stringify(formData));
        try {
            console.log("formData->"+JSON.stringify());
            // formData['startTime'] = {_seconds:new Date(formData['startTime']).getTime() / 1000,_nanoseconds:0};
            // formData['endTime'] = {_seconds:new Date(formData['endTime']).getTime() / 1000,_nanoseconds:0};
            console.log(formData);

            formData.restaurantId = restaurantData.name;

            console.log("Selected Slot at parent!->"+JSON.stringify(selectedSlot));
            const response = await ReservationService.createReservation(formData).then((response)=>{
                console.log(response);
                // Todo: navigate to reservation booking page.
            });
            if (response.status === 201) {
                console.log("Reservation Saved!");
            } else {
                console.error('Failed to create reservation');
            }
        } catch (error) {
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
                        {formData.date && <SlotButton data= {timeSlots} selectedSlot={selectedSlot} onSlotSelect={handleSlotSelect}/>}
                <Button type="submit" > {searchParams.has("isUpdate") ? "Update Reservation":"Create Reservation"}</Button>
            </Form>
        </Container>
    );
}

export default ReservationForm;
