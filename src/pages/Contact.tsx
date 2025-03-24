import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { IFirebaseUser } from "../shared/firebaseTypes";

type ContactParams = {
  landlordId: string;
};

const Contact = () => {
  const [message, setMessage] = useState("");
  const [landlord, setLandlord] = useState<IFirebaseUser | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, _setSearchParams] = useSearchParams();
  const { landlordId } = useParams<ContactParams>();

  useEffect(() => {
    const getLandlord = async () => {
      const docRef = doc(db, "users", landlordId!);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLandlord(docSnap.data() as IFirebaseUser);
      } else {
        toast.error("Could not get landlord data");
      }
    };
    getLandlord();
  }, [landlordId]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value);

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact Landlord</p>
      </header>
      {landlord !== null && (
        <main>
          <div className="contactLandlord">
            <p className="landlordName">{landlord?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea name="message" id="message" className="textarea" value={message} onChange={onChange} />
            </div>
            <a href={`mailto:${landlord.email}?Subject=${searchParams.get("listingName")}&body=${message}`}>
              <button className="primaryButton" type="button">
                Send Message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
};
export default Contact;
