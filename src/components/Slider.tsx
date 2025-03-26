import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.config";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Spinner from "./Spinner";
import { IListing, IListingSchema } from "../shared/firebaseTypes";

const Slider = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<IListing[] | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));
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

    fetchListings();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!listings || listings.length === 0) {
    return <></>;
  }

  return (
    listings && (
      <>
        <p className="exploreheading">Recommended</p>
        <Swiper
          modules={[Navigation, Pagination]}
          style={{ height: "300px" }}
          slidesPerView={1}
          navigation={true}
          pagination={true}>
          {listings.map(({ id, data }) => (
            <SwiperSlide key={id} onClick={() => navigate(`/category/${data.type}/${id}`)}>
              <div
                style={{ background: `url(${data.ImageUrls[0]}) center no-repeat`, backgroundSize: "cover" }}
                className="swiperSlideDiv">
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  ${data.discountedPrice ?? data.regularPrice} {data.type === "rent" && "/ month"}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
};
export default Slider;
