import { useEffect, useState, useRef } from "react";
import { auth } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";

interface IAuthStatus {
  loggedIn: boolean;
  checkingStatus: boolean;
}

export const useAuthStatus = (): IAuthStatus => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const isMounted = useRef(true); // should be unnecessary now

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      }
      setCheckingStatus(false);
    });

    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);
  return { loggedIn, checkingStatus };
};
