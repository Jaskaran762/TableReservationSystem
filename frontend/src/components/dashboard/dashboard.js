import {
    Container,
    Navbar,
    Nav,
    CardGroup,
    CardBody,
    CardTitle,
    CardText,
    Button,
    Card,
    CardLink
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import {Link, Navigate, Route, useNavigate} from 'react-router-dom';

const dashboard = () => {
    return (
        <>
            <CardGroup>
                <Card style={{ width: '18rem' }}>
                    {/*<Card.Img variant="top" src="holder.js/100px180" />*/}
                    <CardBody>
                        <CardTitle>Restaurants</CardTitle>
                        <CardText>
                            Some quick example text to build on the card title and make up the
                            bulk of the card's content.
                        </CardText>
                        <Link to="/home">
                            <Button variant="primary" >View Restaurants</Button>
                        </Link>
                    </CardBody>
                </Card>
                <Card style={{ width: '18rem' }}>
                    {/*<Card.Img variant="top" src="holder.js/100px180" />*/}
                    <CardBody>
                        <CardTitle>Reservations</CardTitle>
                        <CardText>
                            Some quick example text to build on the card title and make up the
                            bulk of the card's content.
                        </CardText>
                        <Link to="/reservations">
                            <Button variant="primary" >View Reservations</Button>
                        </Link>
                    </CardBody>
                </Card>
                <Card style={{ width: '18rem' }}>
                    {/*<Card.Img variant="top" src="holder.js/100px180" />*/}
                    <CardBody>
                        <CardTitle>Orders</CardTitle>
                        <CardText>
                            Some quick example text to build on the card title and make up the
                            bulk of the card's content.
                        </CardText>
                        <Link to="/orders">
                            <Button variant="primary" >View Orders</Button>
                        </Link>
                        {/*<Button variant="primary" onClick={e => navigate('/restaurants')} >View Restaurants</Button>*/}
                    </CardBody>
                </Card>

                <Card style={{ width: '18rem' }}>
                    {/*<Card.Img variant="top" src="holder.js/100px180" />*/}
                    <CardBody>
                        <CardTitle>Tables Booked</CardTitle>
                        <CardText>
                        View tables booked at time intervals in daily, weekly, and monthly views.
                        </CardText>
                        <Link to="/partnerAPP/tableBooking">
                            <Button variant="primary" >View</Button>
                        </Link>
                        {/*<Button variant="primary" onClick={e => navigate('/restaurants')} >View Restaurants</Button>*/}
                    </CardBody>
                </Card>

            </CardGroup>
        </>
    )
}

export default dashboard;