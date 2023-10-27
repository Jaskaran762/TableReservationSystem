import React, { useEffect, useState } from 'react';
import { fetchReservations } from '../services/ReservationService';

function ReservationList() {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        fetchReservations().then(data => {
            console.log("fetch->"+data);
            setReservations(data);

        });
    }, []);

    return (
        <div>
            <h1>Reservation List</h1>
            <ul>
                {reservations.map((reservation) => (
                    <li key={reservation.id}>
                        User ID: {reservation.userId}
                        Restaurant ID: {reservation.restaurantId}
                        Date: {reservation.date}
                        {/*startTime: {new Date(reservation.startTime.seconds)}*/}
                        {/*endTime: {new Date(reservation.endTime.seconds)}*/}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ReservationList;
