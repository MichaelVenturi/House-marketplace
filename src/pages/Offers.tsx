import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

import ListingItem from "../components/ListingItem";

import { IListing, IListingSchema } from "../shared/firebaseTypes";

const Offers = () => {
  const [listings, setListings] = useState<IListing[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastFetchedListing, setLastFetchedListing] = useState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // get ref
        const listingsRef = collection(db, "listings");
        // create a query
        const q = query(listingsRef, where("offer", "==", true), orderBy("timestamp", "desc"), limit(1));

        // execute query
        const querySnap = await getDocs(q);

        const lastVisible = querySnap.docs[querySnap.docs.length - 1];

        setLastFetchedListing(lastVisible);

        const curListings: IListing[] = [];
        querySnap.forEach((doc) => {
          return curListings.push({
            id: doc.id,
            data: doc.data() as IListingSchema,
          });
        });
        setListings(curListings);
        setLoading(false);
      } catch (err: unknown) {
        console.log(err);
        toast.error("Could not fetch listings");
      }
    };
    fetchListings();
  }, []);

  const onFetchMoreListings = async () => {
    try {
      // get ref
      const listingsRef = collection(db, "listings");
      // create a query
      const q = query(
        listingsRef,
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(10)
      );

      // execute query
      const querySnap = await getDocs(q);

      const lastVisible = querySnap.docs[querySnap.docs.length - 1];

      setLastFetchedListing(lastVisible);

      const curListings: IListing[] = [];
      querySnap.forEach((doc) => {
        return curListings.push({
          id: doc.id,
          data: doc.data() as IListingSchema,
        });
      });
      setListings((prevState) => [...prevState!, ...curListings]);
      setLoading(false);
    } catch (err: unknown) {
      console.log(err);
      toast.error("Could not fetch listings");
    }
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem listing={listing.data} id={listing.id} key={listing.id} />
              ))}
            </ul>
          </main>
          <br />
          <br />
          {lastFetchedListing && (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load more
            </p>
          )}
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  );
};
export default Offers;
