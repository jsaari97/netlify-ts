import { Collection, SubField } from "./types";

export const normalizeCollection = (collection: Collection): SubField | SubField[] => {
  if (collection.files) {
    return collection.files.map(normalizeSubField);
  }

  return normalizeSubField(collection);
};

const normalizeSubField = (field: SubField): SubField => {
  return {
    // ...field,
    name: field.name,
    widget: field.widget,
    fields: field.fields?.map(normalizeSubField),
  };
};
