import axios from "axios";

export const FetchUserData = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/me", {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    console.log(err);
  }
};