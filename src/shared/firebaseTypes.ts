import { FieldValue } from "firebase/firestore";

export interface IFirebaseUser {
  name: string;
  email: string;
  timestamp: FieldValue;
}
