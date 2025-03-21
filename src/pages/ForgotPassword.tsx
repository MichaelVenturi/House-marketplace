import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase.config";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import ArrowRightIcon from "../assets/svg/keyboardArrowRightIcon.svg?react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Email was sent");
    } catch (err: unknown) {
      console.log(err);
      toast.error("Could not send reset email");
    }
  };
  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Forgot Password</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <input type="text" className="emailInput" placeholder="Email" id="email" value={email} onChange={onChange} />
          <Link className="forgotPasswordLink" to="/sign-in">
            Sign in
          </Link>

          <div className="signInBar">
            <div className="signInText">Send reset link</div>
            <button className="signInButton">
              <ArrowRightIcon fill="#ffffff" width="34px" height="34p" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
export default ForgotPassword;
