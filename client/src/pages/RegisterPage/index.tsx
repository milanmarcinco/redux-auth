import { useState, useCallback } from "react";
import { Link, useHistory } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";

import isEmail from "validator/lib/isEmail";
import isAlpha from "validator/lib/isAlpha";

import betterFetch from "../../lib/betterFetch";

import useDispatch from "../../hooks/useDispatch";
import { logIn } from "../../store/authSlice";

import styles from "./RegisterPage.module.scss";

interface IFormInputs {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  password: string;
  passwordRepeat: string;
}

const RegisterPage = () => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const dispatch = useDispatch();

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
          path: "/auth/register",
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

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>
        <b>Create</b> an account
      </h1>

      <form className={styles.form} onSubmit={handleSubmit(onSubmitHandler)}>
        {error && <p className={styles.errorBanner}>{error}</p>}

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
          />
          {errors.nickname && <p className={styles.errorMessage}>{errors.nickname.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Your email</label>
          <input
            id="email"
            type="text"
            {...register("email", {
              required: "Enter your email address",
              maxLength: { value: 50, message: "Your email address is too long" },
              validate: (v) => isEmail(v) || "Enter a valid email address",
            })}
          />
          {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register("password", {
              required: "Enter your password",
              minLength: { value: 8, message: "Password should be atleast 8 characters long" },
              maxLength: { value: 50, message: "Your password is too long" },
            })}
          />
          {errors.password && <p className={styles.errorMessage}>{errors.password.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="passwordRepeat">Repeat your password</label>
          <input
            id="passwordRepeat"
            type="password"
            {...register("passwordRepeat", {
              required: "Enter your password",
              validate: (v) => getValues("password") === v || "Passwords don't match",
            })}
          />
          {errors.passwordRepeat && <p className={styles.errorMessage}>{errors.passwordRepeat.message}</p>}
        </div>

        <div className={styles.buttonsWrapper}>
          <button className={styles.signUpBtn} type="submit" disabled={loading}>
            {loading ? "Loading..." : "Create new account"}
          </button>
          <Link className={styles.logInLink} to="/login">
            or just log in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
