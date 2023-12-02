import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './components/auth/login'
import SignUp from './components/signup';
import Home from './components/home';
import Getdata from './components/getdata';
import ReservationForm from './components/view/Reservations/ReservationForm';
import ListReservations from "./components/view/Reservations/ListReservations";
import Reservation from "./components/Reservation";
import PageRoutes from './components/routes/routes';
import {Container} from "react-bootstrap";
import Header from "./components/headers/headers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MenuSelection from './components/MenuSelection';
import ReservedMenuPage from './components/ReservedMenuPage';
import Restaurant from './components/restaurant';
import {AxiosConfig} from "./services/axiosInstance";

function App() {
  return (
      // <Router>
      // <div className='App'>
      // <Routes>
      //
      // <Route path="/" element={<Auth/>} />
      // <Route path="/signup" element={<SignUp/>}/>
      // <Route path="/home" element={<Home/>}/>
      // <Route path="/getdata" element={<Getdata/>}/>
      // <Route path="/restaurant" element={<Restaurant/>}/>
      // <Route path="/createReservation" element={<ReservationForm/>}/>
      // <Route path="/reservations" element={<ListReservations/>}/>
      // <Route path="/reservation" element={<Reservation/>}/>
      // <Route path="/menu-selection" element={<MenuSelection/>} />
      // <Route path="/reserved-menu" element={<ReservedMenuPage/>} />
      // </Routes>
      // </div>
      // </Router>
 
      // <div className='App' >
          <Router>
                  <Header/>
              <AxiosConfig>
                  <PageRoutes/>
              </AxiosConfig>
              <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
              />
              <ToastContainer />
          </Router>
  );
}

export default App;
