import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase.config";
import Spinner from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

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
      <Swiper
        modules={[Navigation, Pagination]}
        style={{ height: "300px" }}
        slidesPerView={1}
        navigation={true}
        pagination={true}>
        {listing.ImageUrls.map((url, i) => (
          <SwiperSlide key={i}>
            <div
              style={{ background: `url(${url}) center no-repeat`, backgroundSize: "cover" }}
              className="swiperSlideDiv"></div>
          </SwiperSlide>
        ))}
      </Swiper>

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

        <div className="leafletContainer">
          <MapContainer
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            style={{ height: "100%", width: "100%" }}
            zoom={13}
            scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
            />
            <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

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
