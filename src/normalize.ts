import { Collection, Field } from "./types";

export const normalizeCollection = (collection: Collection): Field | Field[] => {
  if (collection.files) {
    return collection.files.map(normalizeField);
  }

  return normalizeField(collection);
};

const normalizeField = (field: Field): Field => {
  return {
    ...field,
    name: field.name,
    widget: field.widget,
    fields: field.fields?.map(normalizeField),
  };
};
