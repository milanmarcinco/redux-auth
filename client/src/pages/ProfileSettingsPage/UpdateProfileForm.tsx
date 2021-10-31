import { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";

import isAlpha from "validator/lib/isAlpha";

import betterFetch from "../../lib/betterFetch";

import useSelector from "../../hooks/useSelector";
import useDispatch from "../../hooks/useDispatch";
import { setUserInfo } from "../../store/authSlice";

import styles from "./UpdateProfilePage.module.scss";

interface IFormInputs {
  firstName: string;
  lastName: string;
  nickname: string;
}

const UpdateProfileForm = () => {
  const user = useSelector((state) => state.user);
  const refreshToken = useSelector((state) => state.refreshToken);

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [updateSuccessful, setUpdateSuccessful] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      firstName: user ? user.firstName : "",
      lastName: user ? user.lastName : "",
      nickname: user ? user.nickname : "",
    },
  });

  const handleUpdate: SubmitHandler<IFormInputs> = useCallback(
    async (formData) => {
      try {
        setLoading(true);
        setError("");
        setUpdateSuccessful(false);

        const data = await betterFetch({
          path: "/auth/update-profile",
          method: "POST",
          body: { user: formData, refreshToken },
        });

        if (data.error) throw new Error(data.error);

        dispatch(setUserInfo(data.user));

        setUpdateSuccessful(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, refreshToken]
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleUpdate)}>
      {error && <p className={styles.errorBanner}>{error}</p>}
      {updateSuccessful && <p className={styles.successBanner}>Your profile was updated</p>}

      <div className={styles.doubleInput}>
        <div className={styles.inputGroup}>
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            type="text"
            {...register("firstName", {
              required: "Enter your first name",
              maxLength: { value: 20, message: "Your first name is too long" },
              validate: (v) => isAlpha(v) || "Your first name contains weird characters",
            })}
            autoComplete="off"
          />
          {errors.firstName && <p className={styles.errorMessage}>{errors.firstName.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            type="text"
            {...register("lastName", {
              required: "Enter your last name",
              maxLength: { value: 20, message: "Your last name is too long" },
              validate: (v) => isAlpha(v) || "Your last name contains weird characters",
            })}
            autoComplete="off"
          />
          {errors.lastName && <p className={styles.errorMessage}>{errors.lastName.message}</p>}
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="nickname">Nickname</label>
        <input
          id="nickname"
          type="text"
          {...register("nickname", {
            required: "Enter your nickname",
            maxLength: { value: 20, message: "Your nickname is too long" },
          })}
          autoComplete="off"
        />
        {errors.nickname && <p className={styles.errorMessage}>{errors.nickname.message}</p>}
      </div>

      <div className={styles.formButtonsWrapper}>
        <button className={styles.primaryBtn} type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update your profile"}
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={history.goBack}>
          or just go back
        </button>
      </div>
    </form>
  );
};

export default UpdateProfileForm;
