import { Collection, FilesField, FolderField, SubField } from "./types";

export const normalizeCollection = (collection: Collection): SubField | SubField[] => {
  if (collection.files) {
    return normalizeFileField(collection);
  }

  return normalizeFolderField(collection);
};

const normalizeFileField = (field: FilesField): SubField[] => {
  const { files = [] } = field;

  return files.map(normalizeSubField);
};

const normalizeFolderField = (field: FolderField): SubField => {
  return normalizeSubField(field);
};

const normalizeSubField = (field: SubField): SubField => {
  return {
    // ...field,
    name: field.name,
    widget: field.widget,
    fields: field.fields?.map(normalizeSubField),
  };
};
