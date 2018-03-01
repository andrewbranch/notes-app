import { createSelector } from "reselect";
import { notesSelector } from "../selectors/notes.selectors";

export const noteSelector = createSelector(
  notesSelector,
  notes => ({ notes })
);
