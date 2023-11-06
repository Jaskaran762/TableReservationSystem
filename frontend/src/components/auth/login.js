import { admin ,auth , googleProvider, db} from "../../config/firebase";
import { signInWithEmailAndPassword,signInWithPopup } from "firebase/auth";
import { setDoc, doc } from 'firebase/firestore';
import { useState } from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {login} from "../redux/userSlice";
import {useDispatch} from "react-redux";
import 'bootstrap/dist/css/bootstrap.css';
import {Button, ButtonGroup, Form} from "react-bootstrap";

function Auth(){
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  console.log(auth?.currentUser?.email);
    var details

    // const collection = db.collection('users');

    const dispatchLoggedInUser = (token) =>{
        dispatch(
            login({
                token: token
            })
        )
    }
    // const checkUserExist = (userId)=>{
    //     return collection.doc(userId)
    //         .get()
    //         .then((doc)=>{
    //             return doc.exists;
    //         }).catch((error)=>{
    //             return false;
    //         });
    // }
  const signIn = async () => {
    try {
        await signInWithEmailAndPassword(auth, email, password).then((resp) => {
        details = resp;
    });
        var user = details.user;
        console.log(JSON.stringify(user));
        // console.log(checkUserExist(user.uid));
        // if(!checkUserExist(user.uid)){
        //     await setDoc(doc(db,"users",user.uid),{
        //             email:user.email,
        //             name:user.displayName
        //         }
        //     );
        // }
        // setUser(user);
        user.getIdToken()
            .then((idToken)=>{
                console.log("JWT Token=>"+ idToken);
                // setToken(idToken);
                dispatchLoggedInUser(idToken);
            });
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
        console.log(JSON.stringify(user));
        // if(!checkUserExist(user.uid)){
        //     await setDoc(doc(db,"users",user.uid),{
        //             email:user.email,
        //             name:user.displayName
        //         }
        //     );
        // }
        user.getIdToken()
            .then((idToken)=>{
                console.log("JWT Token=>"+ idToken);
                // setToken(idToken);
                dispatchLoggedInUser(idToken);
            });
        // setUser(user);
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
      <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail" >
              <Form.Label>Email Address:</Form.Label>
              <Form.Control type='email' onChange={(e) => setEmail(e.target.value)} placeholder="Email" ></Form.Control>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword" >
              <Form.Label>Password:</Form.Label>
              <Form.Control type='password'  onChange={(e) => setPassword(e.target.value)} placeholder="Password" ></Form.Control>
          </Form.Group>
          <Form.Group>
              <ButtonGroup>
              <Button onClick={signIn}>
                  Sign In
              </Button>
              {/*<Link to="/signup">*/}
                  <Button onClick={event => {navigate('/signup')}} > Sign Up</Button>
              {/*</Link>*/}
              <Button onClick={signInWithGoogle} > Continue With Google</Button>
              </ButtonGroup>
          </Form.Group>
      </Form>
  );
};

export default Auth;