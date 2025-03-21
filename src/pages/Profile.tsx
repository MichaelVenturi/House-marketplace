import { useState, useEffect } from "react";
import { auth } from "../firebase.config";
import { User } from "firebase/auth";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    setUser(auth.currentUser);
  }, []);
  return user ? <h1>{user.displayName}</h1> : <h1>nope</h1>;
};
export default Profile;
