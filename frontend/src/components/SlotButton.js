import React, { useState, useEffect } from 'react';
import {fetchAvailableSlots} from "../services/ReservationService";
import {Button, Col, Form, Row} from "react-bootstrap";
import button from "bootstrap/js/src/button"; // Import the function from the previous example
const ReservationService = require("../services/ReservationService");

const SlotButton = ({data,selectedSlot,onSlotSelect})=>{
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedSlotData, setSelectedSlotData] = useState({});
    const handleSlotClick = (event,slot) => {
        event.preventDefault();
        setSelectedSlotData(slot);
        onSlotSelect(event,slot); // Notify parent component about the selected slot
        console.log("selected Slot =>"+selectedSlotData);
    };

    // useEffect(() => {
    //     // console.log()
    //     if(data.date !== undefined && data.date !== ''){
    //         // fetchAvailableSlots(data.date, data.timeSlot.start, data.timeSlot.end, data.restaurantId)
    //         //     .then(value => {
    //         //         const slots = value.data;
    //         //         setTimeSlots(slots); // Fix this line
    //         //     })
    //         //     .catch(error => {
    //         //         console.error('Error fetching available slots:', error);
    //         //     });
    //     }
    // }, [data.date, data.timeSlot.start, data.timeSlot.end, data.restaurantId]);

    return (

            <Form.Group as={Row} className="mb-3" >
                <Form.Label column sm="3">
                    Time Slot:
                </Form.Label>
                <Col sm="10" >
                    { data.map((slot, index) => (
                        <Button
                            key={index}
                            disabled={!slot.isAvailable}
                            name="timeSlot"
                            className={`btn  btn-primary ${ !slot.isAvailable ? 'btn-danger' : ''} `}
                            onClick={(event) => handleSlotClick(event,slot)}
                            style={{ margin: '5px' }}
                            active={slot.start === selectedSlot.start && slot.end === selectedSlot.end}
                        >
                            {slot.start} - {slot.end}
                        </Button>
                    ))}
                </Col>
            </Form.Group>

    );
}

export default SlotButton;
