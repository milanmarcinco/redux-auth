import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation, useHistory } from "react-router-dom";

import useClickOutside from "../../hooks/useClickOutside";

import useSelector from "../../hooks/useSelector";
import useDispatch from "../../hooks/useDispatch";
import { logOut } from "../../store/authSlice";

import betterFetch from "../../lib/betterFetch";

import styles from "./Navbar.module.scss";

const Navbar = () => {
  const refreshToken = useSelector((state) => state.refreshToken);

  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  const [dropdownShown, setDropdownShown] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setDropdownShown(false);
  });

  useEffect(() => {
    setDropdownShown(false);
  }, [location.pathname]);

  const [logOutLoading, setLogOutLoading] = useState(false);

  const logOutHandler = useCallback(
    async (e: any) => {
      try {
        e.target.style.minWidth = e.target.offsetWidth + "px";
        setLogOutLoading(true);

        const data = await betterFetch({
          path: "/auth/logout",
          method: "POST",
          body: { refreshToken },
        });

        if (data.error) throw new Error(data.error);

        setDropdownShown(false);
        setLogOutLoading(false);

        dispatch(logOut());
        setTimeout(() => {
          history.push("/login", { success: "Successfully logged out" });
        }, 0);
      } catch (err) {
        setLogOutLoading(false);
      }
    },
    [refreshToken, dispatch, history]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.navbar}>
        <nav>
          <ul className={styles.nav}>
            <li>
              <NavLink to="/" className={styles.navItem}>
                Dashboard
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Dropdown menu */}
        <div ref={dropdownRef} className={styles.dropdownBtnWrapper}>
          <button onClick={() => setDropdownShown((isOpen) => !isOpen)} className={styles.button} type="button">
            Profile
          </button>

          {dropdownShown && (
            <div className={styles.dropdownWrapper}>
              <ul>
                <li>
                  <Link to="/profile-settings" className={styles.dropdownItemBtn}>
                    Profile settings
                  </Link>
                </li>

                <li>
                  <Link to="/change-password" className={styles.dropdownItemBtn}>
                    Change password
                  </Link>
                </li>

                <li>
                  <button
                    className={styles.dropdownItemBtn}
                    type="button"
                    onClick={logOutHandler}
                    disabled={logOutLoading}
                  >
                    {logOutLoading ? "Loading..." : "Log out"}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
