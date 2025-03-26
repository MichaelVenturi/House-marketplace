import { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";

import { IListingSchema, GeoLocation, ListingType } from "../shared/firebaseTypes";

interface IFormData {
  name: string;
  location: string;
  offer: boolean;
  regularPrice: number;
  discountedPrice: number;
  images?: File[] | null; // optional props are to be deleted before translating into IListingSchema
  bathrooms: number;
  bedrooms: number;
  furnished: boolean;
  parking: boolean;
  lat?: number;
  lng?: number;
  type: ListingType;
  userRef: string;
}

const defaultListingData: IFormData = {
  name: "",
  location: "",
  offer: false,
  regularPrice: 0,
  discountedPrice: 0,
  images: null,
  bathrooms: 1,
  bedrooms: 1,
  furnished: false,
  parking: false,
  lat: 0,
  lng: 0,
  type: "rent",
  userRef: "",
};

type EditListingParams = {
  listingId: string;
};

const EditListing = () => {
  const geolocationEnabled = true;
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState<IListingSchema | null>(null);
  const [formData, setFormData] = useState<IFormData>(defaultListingData);

  const navigate = useNavigate();
  const { listingId } = useParams<EditListingParams>();
  const isMounted = useRef(true);

  // redirect if listing does not belong to user
  useEffect(() => {
    if (auth.currentUser && listing && listing.userRef !== auth.currentUser.uid) {
      toast.error("You cannot edit this listing");
      navigate("/");
    }
  });

  // sets form data to the listing being edited
  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      const docRef = doc(db, "listings", listingId!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data() as IListingSchema);
        setFormData({ ...defaultListingData, ...docSnap.data() });
        setLoading(false);
      } else {
        navigate("/");
        toast.error("Listing does not exist");
      }
    };
    fetchListing();
  }, [listingId, navigate]);

  // adds userRef to formdata
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

  const onMutate = (
    e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.currentTarget; // this will always be the button/input/textarea that triggered the function is attached to
    const { id, value } = target;
    let bool = null;
    // buttons: true/false (incase someone enters a different text field as "true" or "false")
    if (target instanceof HTMLButtonElement) {
      if (value === "true") bool = true;
      if (value === "false") bool = false;
    }

    // files
    if (target instanceof HTMLInputElement && target.type === "file" && target.files) {
      const files: File[] = [];
      for (const [key, value] of Object.entries(target.files)) {
        if (key !== "length") files.push(value);
      }
      setFormData((prevState) => ({
        ...prevState,
        images: files,
      }));
    }
    // text bools numbers
    if (target.type !== "file") {
      setFormData((prevState) => ({
        ...prevState,
        [id]: bool ?? (target.type === "number" ? Number(value) : value),
      }));
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (formData.discountedPrice >= formData.regularPrice) {
      setLoading(false);
      toast.error("Discounted price needs to be less than base price");
      return;
    }
    if (!formData.images || formData.images.length > 6) {
      setLoading(false);
      toast.error("Max 6 images");
      return;
    }

    const geolocation: GeoLocation = { lat: formData.lat!, lng: formData.lng! };
    const location = formData.location;
    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${formData.location}&key=${
          import.meta.env.VITE_GEO_API_KEY
        }`
      );
      const data = await response.json();
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      if (location === undefined || location.includes("undefined")) {
        setLoading(false);
        toast.error("Please enter a correct address");
        return;
      }
    }

    // store image
    const storeImage = async (image: File) => {
      return new Promise((resolve, reject) => {
        const filename = `${auth.currentUser!.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, "images/" + filename);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const ImageUrls = await Promise.all([...formData.images].map((image) => storeImage(image))).catch(() => {
      setLoading(false);
      toast.error("Images not uploaded");
    });

    // sloppy typescript thing.  Wish spreading didn't add the props IListingSchema doesnt have
    // I cant even delete them from the copy since typescript says the copy isnt supposed to have them lmao
    delete formData.images;
    delete formData.lat;
    delete formData.lng;

    const formDataCopy: IListingSchema = {
      ...formData,
      ImageUrls: ImageUrls as string[],
      geolocation,
      timestamp: serverTimestamp() as Timestamp,
    };

    if (!formDataCopy.offer) {
      delete formDataCopy.discountedPrice;
    }
    console.log(formDataCopy);
    const docRef = doc(db, "listings", listingId!);
    await updateDoc(docRef, { ...formDataCopy });
    setLoading(false);
    toast.success("Listing saved");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit listing</p>
        <main>
          <form onSubmit={onSubmit}>
            {/* listing type */}
            <label className="formLabel">Sell / Rent</label>
            <div className="formButtons">
              <button
                type="button"
                id="type"
                value="sale"
                className={`formButton${formData.type === "sale" ? "Active" : ""}`}
                onClick={onMutate}>
                Sell
              </button>
              <button
                type="button"
                id="type"
                value="rent"
                className={`formButton${formData.type === "rent" ? "Active" : ""}`}
                onClick={onMutate}>
                Rent
              </button>
            </div>
            {/* name */}
            <label className="formLabel">Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              className="formInputName"
              maxLength={32}
              minLength={10}
              onChange={onMutate}
              required
            />
            {/* bed/bath */}
            <div className="formRooms flex">
              <div>
                <label className="formLabel">Bedrooms</label>
                <input
                  type="number"
                  id="bedrooms"
                  value={formData.bedrooms}
                  className="formInputSmall"
                  min={1}
                  max={50}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Bathrooms</label>
                <input
                  type="number"
                  id="bathrooms"
                  value={formData.bathrooms}
                  className="formInputSmall"
                  min={1}
                  max={50}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
            {/* parking */}
            <label className="formLabel">Parking</label>
            <div className="formButtons">
              <button
                type="button"
                id="parking"
                className={`formButton${formData.parking ? "Active" : ""}`}
                value="true"
                onClick={onMutate}>
                Yes
              </button>
              <button
                type="button"
                id="parking"
                className={`formButton${!formData.parking ? "Active" : ""}`}
                value="false"
                onClick={onMutate}>
                No
              </button>
            </div>
            {/* furnished */}
            <label className="formLabel">Furnished</label>
            <div className="formButtons">
              <button
                type="button"
                id="furnished"
                className={`formButton${formData.furnished ? "Active" : ""}`}
                value="true"
                onClick={onMutate}>
                Yes
              </button>
              <button
                type="button"
                id="furnished"
                className={`formButton${!formData.furnished ? "Active" : ""}`}
                value="false"
                onClick={onMutate}>
                No
              </button>
            </div>
            {/* address */}
            <label className="formLabel">Address</label>
            <textarea
              className="formInputAddress"
              id="location"
              value={formData.location}
              onChange={onMutate}
              required
            />
            {/* manual lat/long */}
            {!geolocationEnabled && (
              <div className="formLatLng flex">
                <div>
                  <label className="formLabel">Latitude</label>
                  <input
                    type="number"
                    id="lat"
                    className="formInputSmall"
                    value={formData.lat}
                    onChange={onMutate}
                    required
                  />
                </div>
                <div>
                  <label className="formLabel">Longitude</label>
                  <input
                    type="number"
                    id="lng"
                    className="formInputSmall"
                    value={formData.lng}
                    onChange={onMutate}
                    required
                  />
                </div>
              </div>
            )}

            {/* offer */}
            <label className="formLabel">Offer</label>
            <div className="formButtons">
              <button
                type="button"
                id="offer"
                className={`formButton${formData.offer ? "Active" : ""}`}
                value="true"
                onClick={onMutate}>
                Yes
              </button>
              <button
                type="button"
                id="offer"
                className={`formButton${!formData.offer ? "Active" : ""}`}
                value="false"
                onClick={onMutate}>
                No
              </button>
            </div>
            <label className="formLabel">Regular Price</label>
            <div className="formPriceDiv">
              <input
                type="number"
                id="regularPrice"
                className="formInputSmall"
                value={formData.regularPrice}
                onChange={onMutate}
                min={50}
                max={750000000}
                required
              />
              {formData.type === "rent" && <p className="formPriceText">$ / Month</p>}
            </div>

            {formData.offer && (
              <>
                <label className="formLabel">Discounted Price</label>
                <input
                  type="number"
                  id="discountedPrice"
                  className="formInputSmall"
                  value={formData.discountedPrice}
                  onChange={onMutate}
                  min={50}
                  max={750000000}
                  required={formData.offer}
                />
              </>
            )}

            <label className="formLabel">Images</label>
            <p className="imagesInfo">The first image will be the cover (max 6).</p>
            <input
              className="formInputFile"
              type="file"
              name=""
              id="images"
              onChange={onMutate}
              max={6}
              accept=".jpg,.png,.jpeg"
              multiple
              required
            />
            <button className="primaryButton createListingButton" type="submit">
              Edit Listing
            </button>
          </form>
        </main>
      </header>
    </div>
  );
};
export default EditListing;
