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
    <div className="form-container">
      <input placeholder="Email.." onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password.."
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signIn}> Sign In</button>
      <Link to="/signup">
      <button> Sign Up</button>
      </Link>
      <button onClick={signInWithGoogle}>Continue With Google</button>
      {/* <button onClick={logOut}> logOut</button> */}
    </div>
  );
};

export default Auth;