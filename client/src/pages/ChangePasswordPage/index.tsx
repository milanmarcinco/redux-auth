import { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";

import betterFetch from "../../lib/betterFetch";

import useSelector from "../../hooks/useSelector";
import useDispatch from "../../hooks/useDispatch";
import { logOut } from "../../store/authSlice";

import styles from "./ChangePasswordPage.module.scss";

interface IFormInputs {
  oldPassword: string;
  newPassword: string;
  newPasswordRepeat: string;
}

const ChangePasswordPage = () => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshToken = useSelector((state) => state.refreshToken);

  const dispatch = useDispatch();

  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<IFormInputs>({});

  const onSubmitHandler: SubmitHandler<IFormInputs> = useCallback(
    async (formData) => {
      try {
        setLoading(true);
        setError(false);

        const data = await betterFetch({
          path: "/auth/change-password",
          method: "POST",
          body: { user: formData, refreshToken },
        });

        if (data.error) throw new Error(data.error);

        setLoading(false);

        dispatch(logOut());

        setTimeout(() => {
          history.push("/login", { success: "Your password was updated" });
        }, 0);
      } catch (err: any) {
        setLoading(false);
        setError(err.message);
      }
    },
    [dispatch, history, refreshToken]
  );

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>
        <b>Change</b> your password
      </h1>

      <form className={styles.form} onSubmit={handleSubmit(onSubmitHandler)}>
        {error && <p className={styles.errorBanner}>{error}</p>}

        <div className={styles.inputGroup}>
          <label htmlFor="oldPassword">Old password</label>
          <input
            id="oldPassword"
            type="password"
            {...register("oldPassword", {
              required: "Enter your old password",
            })}
          />
          {errors.oldPassword && <p className={styles.errorMessage}>{errors.oldPassword.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            {...register("newPassword", {
              required: "Enter your new password",
              minLength: { value: 8, message: "Password should be atleast 8 characters long" },
              maxLength: { value: 50, message: "Your password is too long" },
            })}
          />
          {errors.newPassword && <p className={styles.errorMessage}>{errors.newPassword.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="newPasswordRepeat">Repeat your new password</label>
          <input
            id="newPasswordRepeat"
            type="password"
            {...register("newPasswordRepeat", {
              required: "Repeat your new password",
              validate: (v) => getValues("newPassword") === v || "Passwords don't match",
            })}
          />
          {errors.newPasswordRepeat && <p className={styles.errorMessage}>{errors.newPasswordRepeat.message}</p>}
        </div>

        <div className={styles.buttonsWrapper}>
          <button className={styles.updateProfileBtn} type="submit" disabled={loading}>
            {loading ? "Loading..." : "Change password"}
          </button>
          <button type="button" className={styles.goBackBtn} onClick={history.goBack}>
            or just go back
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
