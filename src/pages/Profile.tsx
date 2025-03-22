import { useState } from "react";
import { auth, db } from "../firebase.config";
import { User, updateProfile, updateEmail } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface IPersonalDetails {
  name: string;
  email: string;
}

const Profile = () => {
  const user: User = auth.currentUser!;
  const [changeDetails, setChangeDetails] = useState<boolean>(false);
  const [formData, setformData] = useState<IPersonalDetails>({
    name: user.displayName!, // we will only be on this page so long as there is a current user
    email: user.email!,
  });

  const { name, email } = formData;

  const navigate = useNavigate();

  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setformData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  // for now, email field will be immutable
  const onSubmit = async () => {
    try {
      let changesMade = false;
      if (user.displayName !== name) {
        // Update display name
        await updateProfile(user, {
          displayName: name,
        });
        // update in firestore
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          name,
        });
        changesMade = true;
      }

      if (user.email !== email) {
        await updateEmail(user, email);
      }

      if (changesMade) {
        toast.success("Profile details updated");
      }
    } catch (err: unknown) {
      console.log(err);
      toast.error("Could not update profile details");
    }
  };

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              if (changeDetails) onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}>
            {changeDetails ? "Done" : "Change"}
          </p>
        </div>

        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={`profileName${changeDetails ? "Active" : ""}`}
              disabled={!changeDetails}
              value={name!}
              onChange={onChange}
            />
            <input
              type="text"
              id="email"
              className={`profileEmail${changeDetails ? "" : ""}`}
              disabled={true} // no updating email address (for now)
              value={email!}
              onChange={onChange}
            />
          </form>
        </div>
      </main>
    </div>
  );
};
export default Profile;
