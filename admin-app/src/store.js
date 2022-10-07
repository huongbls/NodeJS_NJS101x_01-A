import { createStore } from "redux";
import ReducerRoot from "./Redux/Reducer/ReducerRoot";

const store = createStore(ReducerRoot);

export default store;

// import { configureStore } from "@reduxjs/toolkit";

// export default configureStore({
//   reducer: {},
// });
