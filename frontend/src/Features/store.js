import { configureStore } from "@reduxjs/toolkit";
import { themeSlice } from "./theamSlice";

export const store = configureStore({
  reducer: {
    themeKey: themeSlice.reducer,
  },
});
