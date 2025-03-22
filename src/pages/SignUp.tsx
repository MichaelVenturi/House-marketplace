import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase.config";
import ArrowRightIcon from "../assets/svg/keyboardArrowRightIcon.svg?react";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";
import { FirebaseError } from "firebase/app";
import OAuth from "../components/OAuth";
import { IFirebaseUser } from "../shared/firebaseTypes";

interface ISignUpFormData {
  name: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<ISignUpFormData>({ name: "", email: "", password: "" });
  const { name, email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      //console.log(db);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      updateProfile(auth.currentUser!, {
        displayName: name,
      });

      const formDataCopy: IFirebaseUser = { email, name, timestamp: serverTimestamp() as Timestamp };

      await setDoc(doc(db, "users", user.uid), formDataCopy);
      navigate("/");
    } catch (err: unknown) {
      let errText = "Something went wrong signing up";
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/weak-password":
            errText = "Your password must be at least six characters";
            break;
          case "auth/email-already-in-use":
          case "auth/email-already-exists": // firebase docs shows this code instead, idk just check for both
            errText = "This email is already associated with an account";
            break;
          default:
            break;
        }
      }
      console.log(err);

      toast.error(errText);
    }
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back!</p>
        </header>

        <form onSubmit={onSubmit}>
          <input type="type" className="nameInput" placeholder="Name" id="name" value={name} onChange={onChange} />

          <input type="email" className="emailInput" placeholder="Email" id="email" value={email} onChange={onChange} />

          <div className="passwordInputDiv">
            <input
              type={showPassword ? "text" : "password"}
              className="passwordInput"
              placeholder="Password"
              id="password"
              value={password}
              onChange={onChange}
            />

            <img
              src={visibilityIcon}
              alt="Show password"
              onClick={() => setShowPassword((prevState) => !prevState)}
              className="showPassword"
            />
          </div>

          <Link to="/forgot-password" className="forgotPasswordLink">
            Forgot Password?
          </Link>

          <div className="signUpBar">
            <p className="signUpText">Sign Up</p>
            <button className="signUpButton" type="submit">
              <ArrowRightIcon fill="#ffffff" width="34px" height="34px" />
            </button>
          </div>
        </form>

        <OAuth />
        <Link to="/sign-in" className="registerLink">
          Sign In Instead
        </Link>
      </div>
    </>
  );
};
export default SignUp;
