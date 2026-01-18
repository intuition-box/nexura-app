import { useParams } from "wouter";
import { useEffect } from "react";

const UserReferred = () => {
  const { referrerCode } = useParams();
  console.log({referrerCode})

  useEffect(() => {
    if (referrerCode) {
      localStorage.setItem("ref", referrerCode);
    }

    window.location.replace("/");
  }, []);

  return null;
}

export default UserReferred;
