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
import {selectLoginType} from "../redux/userSlice";

const AdminDashboard = () => {
    const loginType = useSelector(selectLoginType);
    return (
        <>
            <CardGroup>
                <Card style={{ width: '18rem' }}>
                    <CardBody>
                        <CardTitle>Top 10 Restaurants With Most Orders</CardTitle>
                        <CardText>
                            The Chart which shows Top 10 Restaurants with the most orders
                        </CardText>
                        <Link to="/AdminApp/Top10RestaurantOrders">
                            <Button variant="primary" >View Chart</Button>
                        </Link>
                    </CardBody>
                </Card>
            </CardGroup>
        </>
    )
}

export default AdminDashboard;