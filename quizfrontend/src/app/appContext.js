"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import axios from 'axios'
import { postData } from "./endpoints";
import Cookies from 'js-cookie'

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);

  const [alert, setAlert] = useState(null);

  const [loader, setLoader] = useState(true);

  const [confirm, setConfirm] = useState(false);

  const [sound, setSound] = useState(false);

useEffect(() => {
  const token = Cookies.get('token')
  if (token) {
    axios.defaults.headers.common['Authorization'] = `JWT ${token}`
  }

  postData("checkuser")
    .then(res => setUser(res.user || null))
    .catch(() => setUser(null))
    .finally(() => setLoader(false))
}, [])
  

  useEffect(() => {
    if (!alert) return;

    const timer = setTimeout(() => {
      setAlert(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [alert]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,

        alert,
        setAlert,

        loader,
        setLoader,

        confirm,
        setConfirm,

        sound,
        setSound
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);