import { admin ,auth , googleProvider, db} from "../../config/firebase";
import {signInWithEmailAndPassword, signInWithPopup, signOut} from "firebase/auth";
import {setDoc, doc, collection, getDocs, query, where} from 'firebase/firestore';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {login, setUserLoginType, setUserDetails} from "../redux/userSlice";
import {useDispatch} from "react-redux";
import 'bootstrap/dist/css/bootstrap.css';
import {Button, ButtonGroup, Form} from "react-bootstrap";
import {toast} from "react-toastify";

function Auth(){
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const [loginType, setLoginType] = useState("CUSTOMER");

  console.log(auth?.currentUser?.email);
    var details

    // db.collection('users');

    const dispatchLoggedInUser = (token) =>{
        console.log("Id Token->"+token);
        dispatch(
            login({
                token: token
            })
        )
    }
    const dispatchUserDetails = (userDetails) =>{
        console.log("calling fetch userDetails!");
        dispatch(
            setUserDetails({
                user: userDetails
            })
        )
    }
    const dispatchLoginType = (loginType)=>{
        console.log("LoginType -> "+loginType)
        dispatch(
            setUserLoginType({
                loginType: loginType
            })
        )
    }

    const checkAdminAccess = async (userId)=>{
            const myCollection = collection(db, 'admins');
            const field = 'email';
            const value = userId;
            const q = query(myCollection, where(field, '==', value));
            let userExist = false;
            try{
                const querySnapShot = await getDocs(q);
                for (const doc of querySnapShot.docs) {
                    console.log("Checking user Exist in Admins or not=> " + doc.exists());
                    return doc.exists();
                }
                return false;
            }catch (error){
                console.error('Error getting documents: ', error);
                return false;
            }
    }
    const checkUserExist = (userId)=>{
        return collection(db,'users').doc(userId)
            .get()
            .then((doc)=>{
                return doc.exists;
            }).catch((error)=>{
                return false;
            });
    }
  const signIn = async () => {
    try {
        if(loginType === "ADMIN"){
            var checkAdminAccessExist = await checkAdminAccess(email);
            if(!checkAdminAccessExist){
                toast.error("Don't Have Admin Access")
                return;
            }
        }
        await signInWithEmailAndPassword(auth, email, password).then((resp) => {
        details = resp;
    });
        var user = details.user;
        console.log(JSON.stringify(user));
        // if(user.email)
        dispatchUserDetails(user);
        dispatchLoginType(loginType);
        user.getIdToken()
            .then((idToken)=>{
                console.log("JWT Token=>"+ idToken);
                // setToken(idToken);
                dispatchLoggedInUser(idToken);
            });
        if(!checkUserExist(user.uid)){
            await setDoc(doc(db,"users",user.uid),{
                    email:user.email,
                    name:user.displayName
                }
            );
        }
        // setUser(user);
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
    if(loginType === "ADMIN"){
            var checkAdminAccessExist = await checkAdminAccess(user.email);
            if(!checkAdminAccessExist){
                toast.error("Don't Have Admin Access")
                return;
            }
    }
    // if(user.email)
    // {
    //     if(loginType == "ADMIN"){
    //         if(!checkAdminAccess(email)){
    //             toast.error("Don't Have Admin Access")
    //             return;
    //         }
    //     }
    // }
        console.log(JSON.stringify(user));
        dispatchUserDetails(user);
        dispatchLoginType(loginType);
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
          <Form.Group className="mb-3" controlId="formBasicLoginType">
              <Form.Label>Login Type:</Form.Label>
              <Form.Select onChange={(e) => setLoginType(e.target.value)}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="PARTNER">Partner</option>
                  <option value="ADMIN">Admin</option>
              </Form.Select>
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