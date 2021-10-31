import { useCallback, useEffect, useState } from "react";

import betterFetch from "./lib/betterFetch";

import useDispatch from "./hooks/useDispatch";
import { logIn, logOut } from "./store/authSlice";

interface IProps {
  children: React.ReactNode;
}

const Auth = ({ children }: IProps) => {
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const authInit = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return;

      const userString = localStorage.getItem("user");
      if (!userString) throw new Error();
      const user = JSON.parse(userString);

      const data = await betterFetch({
        path: "/auth/renew-token",
        method: "POST",
        body: { refreshToken },
      });

      if (data.error) throw new Error();

      const { accessToken } = data;

      if (accessToken && refreshToken && user) {
        dispatch(logIn({ accessToken, refreshToken, user }));
      } else {
        throw new Error();
      }
    } catch (err) {
      dispatch(logOut());
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    authInit();
  }, [authInit]);

  return (
    <>
      {loading && <>Loading...</>}
      {!loading && children}
    </>
  );
};

export default Auth;
