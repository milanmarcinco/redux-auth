import { memo } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UpdateProfilePage from "./pages/ProfileSettingsPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

import useSelector from "./hooks/useSelector";

function App() {
  const isLoggedIn = useSelector((state) => state.isLoggedIn);

  return (
    <>
      {isLoggedIn && <Navbar />}

      <Switch>
        <PrivateRoute path="/" exact>
          <DashboardPage />
        </PrivateRoute>

        <PrivateRoute path="/profile-settings">
          <UpdateProfilePage />
        </PrivateRoute>

        <PrivateRoute path="/change-password">
          <ChangePasswordPage />
        </PrivateRoute>

        <Route path="/register">{isLoggedIn ? <Redirect to="/" /> : <RegisterPage />}</Route>

        <Route path="/login">{isLoggedIn ? <Redirect to="/" /> : <LoginPage />}</Route>

        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </>
  );
}

export default memo(App);
