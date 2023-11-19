import React, { useEffect, useState } from 'react';
import { fetchReservations } from '../../../services/ReservationService';
import {auth} from "../../../config/firebase";
import {Badge, Button, Table} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

function ReservationList() {
    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
       fetchData();
    }, []);

    const fetchData = () => {
        fetchReservations(auth?.currentUser?.email).then((data) => {
            setReservations(data.data);
        });
    };
    const handleUpdateClick = (restaurantId, reservationId) => {
        const updateUrl = `/restaurants/${restaurantId}/createReservation?isUpdate=true&reservationId=${reservationId}`;
        navigate(updateUrl);
    };
    return (
        <div className="container my-4">
            <h2 className="text-center mb-4">Registration List</h2>
            <Button variant="outline-success" onClick={fetchData}>
                Refresh Data
            </Button>
            <Table striped bordered hover className="mt-3">
                <thead>
                <tr>
                    <th>Restaurant</th>
                    <th>Number of Persons</th>
                    <th>Date Time of Registration</th>
                    <th>Accepted By Restaurant</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {reservations.map((registration) => (
                    <tr key={registration.documentId}>
                        <td>{registration.restaurantId}</td>
                        <td>{registration.numberOfPerson}</td>
                        <td>{`${registration.date} ${registration.timeSlot.start}-${registration.timeSlot.end}`}</td>
                        <td>
                            {registration.isAcceptedByRestaurant ? (
                                <Badge bg="success">Accepted</Badge>
                            ) : (
                                <Badge bg="warning">Pending</Badge>
                            )}
                        </td>
                        <td>
                            <Button
                                variant="primary"
                                onClick={() =>
                                    handleUpdateClick(registration.restaurantId, registration.documentId)
                                }
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

export default ReservationList;
