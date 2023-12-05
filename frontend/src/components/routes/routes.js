import Auth from '../auth/login';
import { useSelector } from "react-redux";
import {selectLoginType, selectUser, selectUserToken} from "../redux/userSlice";
import Landing from "../view/Landing/landing";
import Home from "../home";
import {Navigate, Route, Routes} from "react-router-dom";
import SignUp from "../signup";
import Dashboard from "../dashboard/dashboard";
import ListReservations from "../view/Reservations/ListReservations";
import ReservationForm from "../view/Reservations/ReservationForm";
import Restaurant from "../restaurant";
import ListReservationsPartnerApp from "../view/partner_app/reservations/ListReservationsPartnerApp";
import RestaurantAdmin from '../restaurantAdmin';
import CreateRestaurant from '../createRestaurant';
import MenuSelection from '../MenuSelection';
import ReservedMenuPage from '../ReservedMenuPage';
import TableBookings from '../TableBookings';
import AdminDashboard from "../admin/AdminDashboard";
import Top10RestaurantOrders from "../admin/Top10RestaurantOrders";
import ReviewsOfRestaurant from '../admin/ReviewsOfRestaurant';
import Top10FoodItems from "../admin/Top10FoodItems";
import Top10Customers from "../admin/Top10Customers";
import Top10PeriodsWhenOrdered from "../admin/Top10PeriodsWhenMostOrders";

const Router = ()=> {
    const isAuth = useSelector(selectUser);
    const loginTypeSelector = useSelector(selectLoginType);
    const navigateBasedOnAppType = ()=>{
        console.log("loginTypeSelector=>"+loginTypeSelector?.loginType);
        if(loginTypeSelector?.loginType === "CUSTOMER"){
            return <Navigate to="/dashboard" />
        }else if (loginTypeSelector?.loginType === "PARTNER"){
            return <Navigate to="/partnerAPP/dashboard"/>
        }else if(loginTypeSelector?.loginType === "ADMIN"){
            return <Navigate to="/AdminApp"/>
        }
    }
    // console.log("is Auth ->"+ isAuth);
    return (
        <>
            <Routes>
                <Route>
                    <Route path='/login' element={isAuth ? navigateBasedOnAppType() : <Auth />}/>
                    <Route path="/signup" element={<SignUp/>}/>
                    {/*<Route path="/signupCustomerApp" element={<SignUp/>}/>*/}
                    {/*<Route path='/loginCustomerApp' element={isAuth ? <Navigate to="/customerApp/dashboard" /> : <AuthCustomer />}/>*/}
                </Route>
                <Route path='/' element={<Landing/>}>
                    <Route index element={ isAuth ? navigateBasedOnAppType() : <Navigate to="/" />}/>
                    <Route path='/dashboard' element={<Dashboard/>} />
                    <Route path='/home' element={<Home/>} />
                    <Route path='/restaurant' element={<Restaurant/>} />
                    <Route path='/reservations' element={<ListReservations/>} />
                    <Route path="/menu-selection" element={<MenuSelection/>} />
                    <Route path="/reserved-menu" element={<ReservedMenuPage/>} />
                    <Route path='/restaurants/:restaurantId/createReservation' element={<ReservationForm/>}/>
                </Route>
                <Route path='/partnerAPP' element={<Landing/>}>
                    <Route index element={ isAuth ? <Navigate to="/partnerAPP/dashboard" /> : <Navigate to="/partnerAPP"/>}/>
                    <Route path='/partnerAPP/dashboard' element={<Dashboard/>}/>
                    <Route path='/partnerAPP/restaurants' element={<Home/>}/>
                    <Route path='/partnerAPP/restaurant' element={<RestaurantAdmin/>}/>
                    <Route path='/partnerAPP/createRestaurant' element={<CreateRestaurant/>}/>
                    <Route path='/partnerAPP/tableBooking' element={<TableBookings/>}/>
                    <Route path='/partnerAPP/restaurant/:restaurantId/reservations' element={<ListReservationsPartnerApp/>}/>
                </Route>
                <Route path='/AdminApp' element={<Landing/>}>
                    <Route index element={ isAuth ? <Navigate to="/AdminApp/dashboard" /> : <Navigate to="/AdminApp"/>}/>
                    <Route path='/AdminApp/dashboard' element={<AdminDashboard/>}/>
                    <Route path='/AdminApp/Top10RestaurantOrders' element={<Top10RestaurantOrders/>}/>
                    <Route path='/AdminApp/ReviewsOfRestaurant' element={<ReviewsOfRestaurant/>}/>
                    <Route path='/AdminApp/Top10FoodItems' element={<Top10FoodItems/>}/>
                    <Route path='/AdminApp/Top10Customers' element={<Top10Customers/>}/>
                    <Route path='/AdminApp/Top10Periods' element={<Top10PeriodsWhenOrdered/>}/>
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    )
}
export default Router;
