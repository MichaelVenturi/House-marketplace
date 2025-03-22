import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase.config";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import googleIcon from "../assets/svg/googleIcon.svg";

import { IFirebaseUser } from "../shared/firebaseTypes";

const OAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // check for user
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      // if user does not exist, create user
      if (!docSnap.exists()) {
        const newUser: IFirebaseUser = { name: user.displayName!, email: user.email!, timestamp: serverTimestamp() };
        await setDoc(doc(db, "users", user.uid), newUser);
      }
      navigate("/");
    } catch (err) {
      console.log(err);
      toast.error("Could not authorize with Google");
    }
  };

  return (
    <div className="socialLogin">
      <p>Sign {location.pathname === "/sign-up" ? "up" : "in"} with </p>
      <button className="socialIconDiv" onClick={onGoogleClick}>
        <img className="socialIconImg" src={googleIcon} alt="google" />
      </button>
    </div>
  );
};
export default OAuth;
