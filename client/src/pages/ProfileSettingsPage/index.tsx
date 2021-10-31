import UpdateProfileForm from "./UpdateProfileForm";
import LogOutAllButton from "./LogOutAllButton";
import DeleteProfileForm from "./DeleteProfileForm";

import styles from "./UpdateProfilePage.module.scss";

const UpdateProfilePage = () => {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>
        Profile <b>settings</b>
      </h1>

      <div className={styles.formWrapper}>
        <UpdateProfileForm />
        <LogOutAllButton />
        <DeleteProfileForm />
      </div>
    </div>
  );
};

export default UpdateProfilePage;
