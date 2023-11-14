import Auth from '../auth/login';
import { useSelector } from "react-redux";
import { selectUser } from "../redux/userSlice";
import Landing from "../view/Landing/landing";
import Home from "../home";
import {Navigate, Route, Routes} from "react-router-dom";
import SignUp from "../signup";
import Dashboard from "../dashboard/dashboard";
import ListReservations from "../view/Reservations/ListReservations";
import ReservationForm from "../view/Reservations/ReservationForm";
import Restaurant from "../restaurant";

const Router = ()=> {
    const isAuth = useSelector(selectUser);
    // console.log("is Auth ->"+ isAuth);
    return (
        <>
            <Routes>
                <Route>
                    <Route path='/login' element={isAuth ? <Navigate to="/dashboard" /> : <Auth />}/>
                    <Route path="/signup" element={<SignUp/>}/>
                </Route>
                <Route path='/' element={<Landing/>}>
                    <Route path="/" element={ isAuth ? <Navigate to="/dashboard" /> : <Navigate to="/" />}/>
                    <Route path='/dashboard' element={<Dashboard/>} />
                    <Route path='/home' element={<Home/>} />
                    <Route path='/restaurant' element={<Restaurant/>} />
                    <Route path='/reservations' element={<ListReservations/>} />
                    <Route path='/restaurants/:restaurantId/createReservation' element={<ReservationForm/>}/>
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    )
}
export default Router;