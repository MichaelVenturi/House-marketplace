import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase.config";
import Spinner from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg";
import { IListingSchema } from "../shared/firebaseTypes";

type ListingParams = {
  categoryName: string;
  listingId: string;
};

const Listing = () => {
  const [listing, setListing] = useState<IListingSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const { listingId } = useParams<ListingParams>();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, "listings", listingId!);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log(docSnap.data());
        setListing(docSnap.data() as IListingSchema);
        setLoading(false);
      }
    };
    fetchListing();
  }, [navigate, listingId]);

  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (loading) {
    return <Spinner />;
  }
  if (!listing) {
    return <p>Failed to retrieve data</p>;
  }
  return (
    <main>
      {/* slider */}

      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}>
        <img src={shareIcon} alt="share" />
      </div>

      {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}

      <div className="listingDetails">
        <p className="listingName">
          {listing!.name} - ${listing.offer ? formatPrice(listing.discountedPrice!) : formatPrice(listing.regularPrice)}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">For {listing.type}</p>
        {listing.offer && <p className="discountPrice">${listing.regularPrice - listing.discountedPrice!}</p>}

        <ul className="listingDetailsList">
          <li>{`${listing.bedrooms} Bedroom${listing.bedrooms > 1 ? "s" : ""}`}</li>
          <li>{`${listing.bathrooms} Bathroom${listing.bathrooms > 1 ? "s" : ""}`}</li>
          <li>{listing.parking && "Parking spot"}</li>
          <li>{listing.furnished && "Furnished"}</li>
        </ul>
        <p className="listingLocationTitle">Location</p>
        {/* map */}

        {auth.currentUser?.uid !== listing.userRef && (
          <Link to={`/contact/${listing.userRef}?Listingname=${listing.name}`} className="primaryButton">
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
};
export default Listing;
