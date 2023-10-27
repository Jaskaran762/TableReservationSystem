import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './components/login'
import SignUp from './components/signup';
import Home from './components/home';
import Getdata from './components/getdata';

function App() {
  return (
      <Router>
      <div className='App'>
      <Routes>
    
      <Route path="/" element={<Auth/>} />
      <Route path="/signup" element={<SignUp/>}/>
      <Route path="/home" element={<Home/>}/>
      <Route path="/getdata" element={<Getdata/>}/>
      </Routes>
      </div>
      </Router>
 
  );
}

export default App;
