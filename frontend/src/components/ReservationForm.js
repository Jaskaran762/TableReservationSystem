import React, { useState } from 'react';
import axios from 'axios';
import { firebase } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import {useLocation, useNavigate} from 'react-router-dom';
// import {createReservation} from "../services/ReservationService";
const ReservationService = require("../services/ReservationService");
function ReservationForm() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    // const data = reservationService();
    // Access query parameters
    const paramValue = searchParams.get('paramName');
    // const navigate = useNavigation();
    // navigate("/", {state: {data})
    // const location = useLocation()
    // const data = location.state.data;
    const [formData, setFormData] = useState({
        userId: 'mananmistry10@gmail.com',
        restaurantId: '123',
        date: '2023-10-27',
        startTime: '',
        endTime: '',
        isAcceptedByRestaurant: false,
        numberOfPerson: 0,
        isDeleted: false,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);

        setFormData({
            ...formData,
            [name]: inputValue,
        });
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(new Date(formData['startTime']));
            formData['startTime'] = {_seconds:new Date(formData['startTime']).getTime() / 1000,_nanoseconds:0};
            formData['endTime'] = {_seconds:new Date(formData['endTime']).getTime() / 1000,_nanoseconds:0};
            console.log(formData);
            const response = await ReservationService.createReservation(formData).then((response)=>{
                console.log(response);
                // Todo: navigate to reservation booking page.
            });
            // const response = await axios.post('https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations', formData);
            // reservationService
            if (response.status === 201) {
                console.log("Reservation Saved!");
                // Reservation was successfully created
            } else {
                console.error('Failed to create reservation');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <div>
                    <label>Number of Person:</label>
                    <input
                        type="number"
                        name="numberOfPerson"
                        value={formData.numberOfPerson}
                        onChange={handleInputChange} />
                </div>
                <div>
                    <label>Start Time:</label>
                    <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleInputChange} />
                </div>
                <div>
                    <label>End Time:</label>
                    <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleInputChange}/>
                </div>
            </div>
            <button type="submit">Create Reservation</button>
        </form>
    );
}

export default ReservationForm;
