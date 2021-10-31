import { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";

import betterFetch from "../../lib/betterFetch";

import useSelector from "../../hooks/useSelector";
import useDispatch from "../../hooks/useDispatch";
import { logOut } from "../../store/authSlice";

import styles from "./UpdateProfilePage.module.scss";

interface IFormInputs {
  password: string;
}

const DeleteProfileForm = () => {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const refreshToken = useSelector((state) => state.refreshToken);

  const dispatch = useDispatch();
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({});

  const deleteSubmitHandler: SubmitHandler<IFormInputs> = useCallback(
    async (formData) => {
      try {
        setLoading(true);
        setError("");

        const data = await betterFetch({
          path: "/auth/delete-profile",
          method: "POST",
          body: { user: formData, refreshToken },
        });

        if (data.error) throw new Error(data.error);

        setLoading(false);

        dispatch(logOut());
        history.push("/login", { success: "Your account was successfully deleted" });
      } catch (err: any) {
        setLoading(false);
        setError(err.message);
      }
    },
    [dispatch, refreshToken, history]
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit(deleteSubmitHandler)}>
      {error && <p className={styles.errorBanner}>{error}</p>}

      <div className={styles.inputGroup}>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password", { required: true })} className={styles.red} />
        {errors.password?.type === "required" && <p className={styles.errorMessage}>Enter your password</p>}
      </div>

      <div className={styles.formButtonsWrapper}>
        <button className={styles.dangerBtn} type="submit" disabled={loading}>
          {loading ? "Deleting..." : "DELETE ACCOUNT"}
        </button>
      </div>
    </form>
  );
};

export default DeleteProfileForm;
