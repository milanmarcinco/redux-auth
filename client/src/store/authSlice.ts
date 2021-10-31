import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import betterFetch from "../lib/betterFetch";

interface IAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    nickname: string;
    email: string;
    createdAt: string;
  } | null;
}

interface ILogInPayload {
  accessToken: string;
  refreshToken: string;
  user: IAuthState["user"];
}

export const logIn = createAsyncThunk("auth/logIn", (logInPayload: ILogInPayload, { getState, dispatch }) => {
  const { accessToken, refreshToken, user } = logInPayload;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", JSON.stringify(user));

  // Access token auto-renew every 25 minutes
  const autoRenewToken = async () => {
    const state = getState() as IAuthState;

    try {
      if (!state.isLoggedIn) return;

      const data: {
        accessToken: string;
        error: string | null;
        statusCode: number;
      } = await betterFetch({
        path: "/auth/renew-token",
        method: "POST",
        body: { refreshToken },
      });

      if (data.statusCode === 401) return dispatch(logOut());

      if (data.error) throw new Error();

      dispatch(authSlice.actions.renewToken(data.accessToken));

      setTimeout(autoRenewToken, 25 * 60 * 1000);
    } catch (err) {
      if (!state.isLoggedIn) return;
      setTimeout(autoRenewToken, 30 * 1000);
    }
  };

  setTimeout(autoRenewToken, 25 * 60 * 1000);

  return logInPayload;
});

export const logOut = createAsyncThunk("auth/logOut", () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
});

export const setUserInfo = createAsyncThunk("auth", (user: IAuthState["user"]) => {
  localStorage.setItem("user", JSON.stringify(user));

  return user;
});

const initState: IAuthState = {
  accessToken: null,
  refreshToken: null,
  isLoggedIn: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initState,
  reducers: {
    renewToken: (state, { payload }: { payload: string }) => {
      state.accessToken = payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(logIn.fulfilled, (state, { payload }) => {
      const { accessToken, refreshToken, user } = payload;

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isLoggedIn = true;
      state.user = user;
    });

    builder.addCase(logOut.fulfilled, (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      state.user = null;
    });

    builder.addCase(setUserInfo.fulfilled, (state, { payload }) => {
      state.user = payload;
    });
  },
});

export default authSlice.reducer;
