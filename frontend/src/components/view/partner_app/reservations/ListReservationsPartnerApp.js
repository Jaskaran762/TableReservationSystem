import React, { useEffect, useState } from 'react';
import { auth } from "../../../../config/firebase";
import { Badge, Button, Table } from "react-bootstrap";
import {useNavigate, useParams} from "react-router-dom";
import {
    fetchReservationsForPartner,
    toggleReservationStatus
} from "../../../../services/ReservationService";

    function ListReservationPartnerApp() {
    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();
    const {restaurantId} = useParams();
    useEffect(() => {
        fetchData(restaurantId);
    }, []);

    const fetchData = (restaurantId) => {
        fetchReservationsForPartner(restaurantId).then((data) => {
            setReservations(data.data);
        });
    };

    const allowedToUpdate = (startTime)=>{

        const currentTime = new Date();
        const oneHourBeforeStart = new Date(startTime);
        oneHourBeforeStart.setHours(oneHourBeforeStart.getHours() - 1);
        console.log("oneHourBeforeStart->"+oneHourBeforeStart);
        return currentTime<oneHourBeforeStart;
    }

    const handleUpdateClick = (restaurantId, reservationId, startTime) => {
        const currentTime = new Date();
        const oneHourBeforeStart = new Date(startTime);
        oneHourBeforeStart.setHours(oneHourBeforeStart.getHours() - 1);

        if (currentTime < oneHourBeforeStart) {
            const updateUrl = `/restaurants/${restaurantId}/createReservation?isUpdate=true&reservationId=${reservationId}`;
            navigate(updateUrl);
        } else {
            console.log("Cannot update or accept reservations less than 1 hour before the start time.");
        }
    };
    const handleStatusToggle = async (reservationId,data) => {
        const response = await toggleReservationStatus(reservationId,data);
        if (response.status === 200) {
            const updatedReservations = reservations.map((reservation) =>
                reservation.id === reservationId
                    ? { ...reservation, isAcceptedByRestaurant: !data.isAcceptedByRestaurant }
                    : reservation
            );
            setReservations(updatedReservations);
            console.log("Reservation updated!");
        } else {
            console.error('Failed to update reservation');
        }
    };
    return (
        <div className="container my-4">
            <h2 className="text-center mb-4">Reservation List</h2>
            <Button variant="outline-success" onClick={fetchData}>
                Refresh Data
            </Button>
            <Table striped bordered hover className="mt-3">
                <thead>
                <tr>
                    <th>Restaurant</th>
                    <th>Number of Persons</th>
                    <th>Date Time of Registration</th>
                    <th>Reservation Status</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {reservations.map((reservation) => (
                    <tr key={reservation.documentId}>
                        <td>{reservation.restaurantId}</td>
                        <td>{reservation.numberOfPerson}</td>
                        <td>{`${reservation.date} ${reservation.timeSlot.start}-${reservation.timeSlot.end}`}</td>
                        <td>
                            {reservation.isAcceptedByRestaurant ? (
                                <Badge bg="success">Accepted</Badge>
                            ) : (
                                <Badge bg="warning">Pending</Badge>
                            )}
                        </td>
                        <td>
                            {/*{!reservation.isAcceptedByRestaurant && (*/}
                            {allowedToUpdate(`${reservation.date} ${reservation.timeSlot.start}`) ?

                                <Button
                                    variant={reservation.isAcceptedByRestaurant ? "danger":"success"}
                                    onClick={() => handleStatusToggle(reservation.documentId, reservation)}
                                >
                                    {reservation.isAcceptedByRestaurant ? "Reject":"Accept"}
                                </Button>
                                :""
                            }

                            {/*)}*/}
                            <Button
                                variant="primary"
                                onClick={() =>
                                    handleUpdateClick(
                                        reservation.restaurantId,
                                        reservation.documentId,
                                        `${reservation.date} ${reservation.timeSlot.start}`
                                    )
                                }
                                disabled={isOldReservation(reservation.date, reservation.timeSlot.start)}
                            >
                                Update
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
}
const isOldReservation = (date, startTime) => {
    const currentDateTime = new Date();
    const reservationDateTime = new Date(`${date} ${startTime}`);
    return currentDateTime > reservationDateTime;
};

export default ListReservationPartnerApp;
