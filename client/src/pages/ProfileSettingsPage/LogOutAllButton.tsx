import { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";

import betterFetch from "../../lib/betterFetch";

import useSelector from "../../hooks/useSelector";
import useDispatch from "../../hooks/useDispatch";
import { logOut } from "../../store/authSlice";

import styles from "./UpdateProfilePage.module.scss";

const LogOutAllButton = () => {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const refreshToken = useSelector((state) => state.refreshToken);

  const dispatch = useDispatch();
  const history = useHistory();

  const LogOutAllHandler = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await betterFetch({
        path: "/auth/logout-all",
        method: "POST",
        body: { refreshToken },
      });

      if (data.error) throw new Error(data.error);

      setLoading(false);

      dispatch(logOut());

      setTimeout(() => {
        history.push("/login", { success: "Successfully logged out from all devices" });
      }, 0);
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  }, [dispatch, refreshToken, history]);

  return (
    <div className={styles.form}>
      {error && <p className={styles.errorBanner}>{error}</p>}
      <div className={styles.inputGroup}>
        <label>Log out from all devices</label>
        <button onClick={LogOutAllHandler} className={styles.actionBtn} type="submit" disabled={loading}>
          {loading ? "Logging out..." : "Log out everywhere"}
        </button>
      </div>
    </div>
  );
};

export default LogOutAllButton;
