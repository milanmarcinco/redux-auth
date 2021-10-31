import { Route, Redirect } from "react-router-dom";
import useSelector from "../hooks/useSelector";

interface IProps {
  path: string;
  children?: React.ReactNode;
  exact?: boolean;
}

const PrivateRoute = ({ children, ...rest }: IProps) => {
  const isLoggedIn = useSelector((state) => state.isLoggedIn);

  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLoggedIn ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
