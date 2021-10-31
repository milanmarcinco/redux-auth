import { useDispatch } from "react-redux";
import store, { AppDispatch } from "../store";

const useAppDispatch = () => useDispatch<AppDispatch>();

export type Dispatch = typeof store.dispatch;
export default useAppDispatch;
