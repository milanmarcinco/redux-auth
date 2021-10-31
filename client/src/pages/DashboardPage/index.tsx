import useSelector from "../../hooks/useSelector";

import { Link } from "react-router-dom";

import styles from "./DashboardPage.module.scss";

const DashboardPage = () => {
  const user = useSelector((state) => state.user);

  const date = new Date(user?.createdAt || "");
  const day = getDayWithSuffix(date.getDate());
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return (
    <div className={styles.wrapper}>
      {user && (
        <Link to="/profile-settings" className={styles.card}>
          <p className={styles.firstName}>{user.firstName}</p>
          <p className={styles.lastName}>{user.lastName}</p>
          <p className={styles.email}>{user.email}</p>
          <p className={styles.date}>{`${day} ${month} ${year}`}</p>
        </Link>
      )}
    </div>
  );
};

export default DashboardPage;

const getDayWithSuffix = (day: number | string): string => {
  const dayString = typeof day === "string" ? day : String(day);

  let suffix;
  switch (dayString) {
    case "1":
      suffix = "st";
      break;
    case "2":
      suffix = "nd";
      break;
    case "3":
      suffix = "rd";
      break;
    default:
      suffix = "th";
      break;
  }

  return dayString + suffix;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
