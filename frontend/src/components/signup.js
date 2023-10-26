import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

function SignUp(){
  const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const signUpHandle = async()=>{
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          console.log('User created:', userCredential.user);

          await setDoc(doc(db,"users",user.uid),{
              email:user.email,
              name:name
          });

          console.log("user saved")
          navigate('/')
        }
        catch(err){
          console.error(JSON.stringify(err, null, 2));
          
        }
      };

      return (
        <div className="form-container">
          <input placeholder="Name.." onChange={(e) => setName(e.target.value)} />
          <input placeholder="Email.." onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            placeholder="Password.."
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={signUpHandle}>Sign Up</button>
        </div>
      );
}

export default SignUp;