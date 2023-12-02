import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {getDocs, collection, query, where, setDoc, doc} from 'firebase/firestore';
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import {Button, ButtonGroup, Container, Form} from "react-bootstrap";
import {setUserDetails, setUserLoginType} from "./redux/userSlice";
import {useDispatch} from "react-redux";
import {toast} from "react-toastify";

function SignUp(){
  const navigate = useNavigate();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [name, setName] = useState();
    const dispatch = useDispatch();
    const [loginType, setLoginType] = useState("CUSTOMER");

    const verifyFormData = () => {

        if (!email || !password || !name) {
            toast.error('Please fill in all fields');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return false;
        }

        return true;
    };
    const signUpHandle =  ()=>{
        console.log("SignUpHandle Has been called!");
        // console.log("CheckUserExists=>"+checkUserExist(email));
        console.log(email);
        if(verifyFormData()){
            checkUserExist(email)
                .then(async (userExist) => {
                    if (userExist) {
                        console.log("UserExist=>" + userExist);
                        toast.error("User Already Exist with the same Email.")
                    } else {
                        console.log("UserDoesn't Exist");
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        const user = userCredential.user;
                        dispatchUserDetails(user);
                        dispatchLoginType(loginType);
                        console.log('User created:', userCredential.user);
                        await setDoc(doc(db,"users",user.uid),{
                            email:user.email,
                            name:name
                        });
                        navigate('/');
                        // navigate based on type of login
                    }
                });
        }
        // try {
        //     console.log("checkUserExist::"+checkUserExist());
        //     if(!checkUserExist()){
        //         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        //         const user = userCredential.user;
        //         dispatchUserDetails(user);
        //         dispatchLoginType(loginType);
        //         console.log('User created:', userCredential.user);
        //
        //         await setDoc(doc(db,"users",user.uid),{
        //             email:user.email,
        //             name:name
        //         });
        //
        //         console.log("user saved")
        //         console.log("Auth From Sign Up"+auth?.currentUser?.email)
        //         navigate('/')
        //     }else {
        //         toast.error("User Already Exist!");
        //         navigate('/login');
        //     }
        // }
        // catch(err){
        //     console.log(JSON.stringify(err));
        //   console.error(JSON.stringify(err, null, 2));
        // }
      };

    const checkUserExist = async (userId)=>{
        const myCollection = collection(db, 'users');
        const field = 'email';
        const value = userId;
        const q = query(myCollection, where(field, '==', value));
        let userExist = false;
        try{
            const querySnapShot = await getDocs(q);

            for (const doc of querySnapShot.docs) {
                console.log("checkUserExistOrNot => " + doc.exists());
                return doc.exists();
            }
            return false;
        }catch (error){
            console.error('Error getting documents: ', error);
            return false;
        }
            //     querySnapshot.forEach((doc) => {
            //         console.log("checkUserExistOrNot=>"+doc.exists());
            //         userExist = doc.exists();
            //         // return doc.exists();
            //     });
            // })

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

      return (
          <Container className={'mt-5'} >
          <Form>
              <Form.Group className="mb-3" controlId="formBasicName" >
                  <Form.Label>Name:</Form.Label>
                  <Form.Control type='text' onChange={(e) => setName(e.target.value)} placeholder="Name" ></Form.Control>
              </Form.Group>
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
                  </Form.Select>
              </Form.Group>
              <Form.Group>
                  <ButtonGroup>
                      <Button onClick={signUpHandle}>
                          Sign Up
                      </Button>
                      {/*<Button onClick={signUpHandle} > Continue With Google</Button>*/}
                  </ButtonGroup>
              </Form.Group>
          </Form>
          </Container>

          // <div className="form-container">
          //     <input placeholder="Name.." onChange={(e) => setName(e.target.value)} />
          //     <input placeholder="Email.." onChange={(e) => setEmail(e.target.value)} />
          //     <input
          //         type="password"
          //         placeholder="Password.."
          //         onChange={(e) => setPassword(e.target.value)}
          //     />
          //     <button onClick={signUpHandle}>Sign Up</button>
          // </div>
      );
}

export default SignUp;