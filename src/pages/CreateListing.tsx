import { useState, useEffect, useRef } from "react";
import { IListingSchema } from "../shared/firebaseTypes";
import { auth } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

const defaultListingData: IListingSchema = {
  name: "",
  location: "",
  offer: false,
  regularPrice: 0,
  ImageUrls: [],
  bathrooms: 0,
  bedrooms: 0,
  furnished: false,
  parking: false,
  geoLocation: {
    lat: 0,
    lng: 0,
  },
  timestamp: null,
  type: "rent",
  userRef: "",
};

const CreateListing = () => {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IListingSchema>(defaultListingData);

  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate("/sign-in");
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  if (loading) {
    return <Spinner />;
  }

  return <div>CreateListing</div>;
};
export default CreateListing;
