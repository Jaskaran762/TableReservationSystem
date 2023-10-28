import React, {useEffect, useState} from 'react';
import {fetchReservation} from "../services/ReservationService";

function ReservationDetail() {
    let reservationId = "KrKToxZHTvG0jKrUSxRN";
    const [reservation, setReservation] = useState({});
    useEffect(() => {
        fetchReservation(reservationId).then(data => {
            console.log("fetch->"+data);
            setReservation(data);
        });
    }, []);
    return (
        <div>
            <h1>Reservation Details</h1>
            <ul>
                <li>
                    User ID: {reservation.userId}
                </li>
                <li>
                    Restaurant ID: {reservation.restaurantId}
                </li>
                <li>
                    Date: {reservation.date}
                </li>
            </ul>
        </div>
    );
}

export default ReservationDetail;