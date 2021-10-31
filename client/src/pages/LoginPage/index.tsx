import { useState, useCallback, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import betterFetch from "../../lib/betterFetch";

import useDispatch from "../../hooks/useDispatch";
import { logIn } from "../../store/authSlice";

import styles from "./LoginPage.module.scss";

interface IFormInputs {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const history = useHistory<any>();

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({});

  const onSubmitHandler: SubmitHandler<IFormInputs> = useCallback(
    async (formData) => {
      try {
        setLoading(true);
        setError(false);

        const data = await betterFetch({
          path: "/auth/login",
          method: "POST",
          body: { user: formData },
        });

        if (data.error) throw new Error(data.error);

        const { accessToken, refreshToken, user } = data;

        setLoading(false);

        dispatch(
          logIn({
            accessToken,
            refreshToken,
            user,
          })
        );

        history.push("/dashboard");
      } catch (err: any) {
        setLoading(false);
        setError(err.message);
      }
    },
    [dispatch, history]
  );

  useEffect(() => {
    if (error) return setSuccessMessage("");
    setSuccessMessage(history.location.state?.success);
  }, [history.location.state, error]);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>
        <b>Sign</b> in
      </h1>
      <form className={styles.form} onSubmit={handleSubmit(onSubmitHandler)}>
        {error && <p className={styles.errorBanner}>{error}</p>}
        {successMessage && <p className={styles.successBanner}>{successMessage}</p>}

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input id="email" type="text" {...register("email", { required: true, validate: (v) => isEmail(v) })} />
          {errors.email?.type === "required" && <p className={styles.errorMessage}>Enter your email address</p>}
          {errors.email?.type === "validate" && <p className={styles.errorMessage}>Enter valid email address</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password", { required: true })} />
          {errors.password?.type === "required" && <p className={styles.errorMessage}>Enter your password</p>}
        </div>

        <div className={styles.buttonsWrapper}>
          <button className={styles.logInBtn} type="submit" disabled={loading}>
            {loading ? "Loading..." : "Log In"}
          </button>
          <Link className={styles.signUpLink} to="/register">
            or create an account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
