import { Link } from "react-router-dom";
import DeleteIcon from "../assets/svg/deleteIcon.svg?react";
import bedIcon from "../assets/svg/bedIcon.svg";
import bathtubIcon from "../assets/svg/bathtubIcon.svg";
import { IListingSchema } from "../shared/firebaseTypes";

interface IListingItemProps {
  listing: IListingSchema;
  id: string;

  onDelete?: (id: string, name: string) => void;
}

const ListingItem: React.FC<IListingItemProps> = ({ listing, id, onDelete }) => {
  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  return (
    <li className="categoryListing">
      <Link to={`/catgeory/${listing.type}/${id}`} className="categoryListingLink">
        <img src={listing.ImageUrls[0]} alt={listing.name} className="categoryListingImg" />
        <div className="categoryListingDetails">
          <p className="categoryListingLocation">{listing.location}</p>
          <p className="categoryListingName">{listing.name}</p>
          <p className="categoryListingPrice">
            ${listing.offer ? formatPrice(listing.discountedPrice!) : formatPrice(listing.regularPrice)}
            {listing.type === "rent" && " / Month"}
          </p>
          <div className="categoryListingInfoDiv">
            <img src={bedIcon} alt="bed" />
            <p className="categoryListingInfoText">{`${listing.bedrooms} Bedroom${listing.bedrooms > 1 ? "s" : ""}`}</p>
            <img src={bathtubIcon} alt="bath" />
            <p className="categoryListingInfoText">{`${listing.bathrooms} Bathroom${
              listing.bathrooms > 1 ? "s" : ""
            }`}</p>
          </div>
        </div>
      </Link>

      {onDelete && (
        <DeleteIcon className="removeIcon" fill="rgb(231, 76,60)" onClick={() => onDelete(id, listing.name)} />
      )}
    </li>
  );
};
export default ListingItem;
