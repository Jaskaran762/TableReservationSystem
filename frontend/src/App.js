import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './components/auth/login'
import SignUp from './components/signup';
import Home from './components/home';
import Getdata from './components/getdata';
import ReservationForm from './components/ReservationForm';
import ListReservations from "./components/ListReservations";
import Reservation from "./components/Reservation";
import PageRoutes from './components/routes/routes';
import {Container} from "react-bootstrap";
import Header from "./components/headers/headers";

function App() {
    // <Router>
    // <div className='App'>
    // <Routes>

    // {/*<Route path="/" element={<Auth/>} />*/}
    // {/*<Route path="/signup" element={<SignUp/>}/>*/}
    // {/*<Route path="/home" element={<Home/>}/>*/}
    // {/*<Route path="/getdata" element={<Getdata/>}/>*/}
    // {/*<Route path="/createReservation" element={<ReservationForm/>}/>*/}
    // {/*<Route path="/reservations" element={<ListReservations/>}/>*/}
    // {/*    <Route path="/reservation" element={<Reservation/>}/>*/}
    // {/*</Routes>*/}
    // </div>
    // </Router>
  return (
      // <div className='App' >
          <Router>
              <Container style={{maxWidth:'100vm',padding:0}}>
                  <Header/>
                  <PageRoutes/>
              </Container>
          </Router>
      // </div>
  );
}

export default App;
