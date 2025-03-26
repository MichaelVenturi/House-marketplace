import { useState, useEffect } from "react";
import { auth, db } from "../firebase.config";
import { User, updateProfile, updateEmail } from "firebase/auth";
import { doc, updateDoc, collection, getDocs, query, where, orderBy, deleteDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ListingItem from "../components/ListingItem";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import homeIcon from "../assets/svg/homeIcon.svg";

import { IListing, IListingSchema } from "../shared/firebaseTypes";

interface IPersonalDetails {
  name: string;
  email: string;
}

const Profile = () => {
  const user: User = auth.currentUser!;
  const [changeDetails, setChangeDetails] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<IListing[] | null>(null);
  const [formData, setformData] = useState<IPersonalDetails>({
    name: user.displayName!, // we will only be on this page so long as there is a current user
    email: user.email!,
  });

  const { name, email } = formData;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, where("userRef", "==", auth.currentUser!.uid), orderBy("timestamp", "desc"));
      const querySnap = await getDocs(q);
      const curListings: IListing[] = [];
      querySnap.forEach((doc) => {
        return curListings.push({
          id: doc.id,
          data: doc.data() as IListingSchema,
        });
      });
      setListings(curListings);
      setLoading(false);
    };
    fetchUserListings();
  }, [auth.currentUser?.uid]);

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

  const onDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, "listings", id));
      const updatedListings = listings!.filter((listing) => listing.id !== id);
      setListings(updatedListings);
      toast.success("Listing deleted");
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
        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>

        {!loading && listings && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};
export default Profile;
