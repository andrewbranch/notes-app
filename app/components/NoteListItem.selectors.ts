import { createSelector } from "reselect";
import { notesSelector } from "../selectors/notes.selectors";

export const noteListItemSelector = createSelector(
  notesSelector,
  notes => ({ notes })
);
