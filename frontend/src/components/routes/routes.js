import Auth from '../auth/login';
import { useSelector } from "react-redux";
import { selectUser } from "../redux/userSlice";
import Landing from "../view/Landing/landing";
import Home from "../home";
import {Navigate, Route, Routes} from "react-router-dom";
import SignUp from "../signup";
const Router = ()=> {
    const isAuth = useSelector(selectUser);
    // console.log("is Auth ->"+ isAuth);
    return (
        <>
            <Routes>
                <Route>
                    <Route path='/login' element={isAuth ? <Navigate to="/home" /> : <Auth />}/>
                    <Route path="/signup" element={<SignUp/>}/>
                </Route>
                <Route path='/' element={<Landing/>}>
                    <Route path="/" element={ isAuth ? <Navigate to="/home" /> : <Navigate to="/error" />}/>
                    <Route path='/home' element={<Home/>} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    )
}
export default Router;