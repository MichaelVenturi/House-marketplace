import { Timestamp } from "firebase/firestore";

export interface IFirebaseUser {
  name: string;
  email: string;
  timestamp: Timestamp;
}

export type GeoLocation = {
  lat: number;
  lng: number;
};

export type ListingType = "rent" | "sale";

export interface IListingSchema {
  name: string;
  location: string;
  offer: boolean;
  regularPrice: number;
  discountedPrice?: number;
  ImageUrls: string[];
  bathrooms: number;
  bedrooms: number;
  furnished: boolean;
  parking: boolean;
  geolocation: GeoLocation;
  timestamp: Timestamp | null;
  type: ListingType;
  userRef: string;
}

export interface IListing {
  id: string;
  data: IListingSchema;
}
