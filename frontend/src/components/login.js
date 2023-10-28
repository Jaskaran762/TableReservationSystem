import { admin ,auth , googleProvider, db} from "../config/firebase";
import { signInWithEmailAndPassword,signInWithPopup } from "firebase/auth";
import { setDoc, doc } from 'firebase/firestore';
import { useState } from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Auth(){
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  console.log(auth?.currentUser?.email);
    var details
  const signIn = async () => {
    try {
        await signInWithEmailAndPassword(auth, email, password).then((resp) => {
        details = resp;
    });
        var user = details.user;
        //console.log("Details->"+details);
        console.log(JSON.stringify(user));
        await setDoc(doc(db,"users",user.uid),{
                email:user.email,
                name:user.displayName
            }
        );
    navigate('/home');
    } catch (err){
      console.error(err);
    }
  };

  const signInWithGoogle = async () => {
    try {
     await signInWithPopup(auth,googleProvider).then((resp) =>{
        details = resp;
    });
    var user = details.user;
    //console.log("Details->"+details);
    console.log(JSON.stringify(user));
        await setDoc(doc(db,"users",user.uid),{
            email:user.email,
            name:user.displayName
        }
  );
    navigate('/home')
    } catch (err){
      console.error(err);
    }
  };
  
  // const logOut = async () => {
  //   try {
  //   await signOut(auth);
  //   } catch (err){
  //     console.error(err);
  //   }
  // };

  return (
    <div className="container">
      <div className="sidebar">
        <h1>Restaurant Search</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>City: </label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label>Name: </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Rating (Min): </label>
            <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} />
          </div>
          <button type="submit">Search</button>
        </form>
        {error && <div>Error: {error.message}</div>}
      </div>
      <div className="content">
        <ul>
          {restaurants.map((restaurant) => (
            <li key={restaurant.name} className="res">
              {/* Wrap the contents in a Link component */}
              <Link to="/restaurant">
                <img src={restaurant.photo} alt={restaurant.name} width="100" />
                <div>Name: {restaurant.name}</div>
                <div>City: {restaurant.city}</div>
                <div>Location: {restaurant.location}</div>
                <div>Rating: {restaurant.resRating}</div>
                <div>Opening Time: {restaurant.openingTime}</div>
                <div>Closing Time: {restaurant.closingTime}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;
