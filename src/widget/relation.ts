import { DEFAULT_DELIMITER } from "../constants";

export const resolveRelations =
  ({ delimiter = DEFAULT_DELIMITER } = {}) =>
  (type: string, _i: number, typeArray: string[]): string => {
    return type.replace(/(~.*?)(;|\[)/g, (_s, match: string, closingChar: string) => {
      const resolveType = (relationType: string) => {
        const [_, collectionName, fieldPath] = relationType.match(/^~(.*)\/(.*)/) ?? [];

        // if string template
        if (fieldPath.includes("{{")) {
          return "string";
        }

        const fieldSlugs = fieldPath
          .split(".")
          .filter((s, i, a) => !(s === "*" && i !== a.length - 1));

        const walker = (collection: string, defaultValue: string): string => {
          const collectionRegex = new RegExp(`^interface\\s${collection}\\s`);
          const targetCollection = typeArray.find((t) => t.match(collectionRegex));

          const slug = fieldSlugs[0];

          const fieldRegex = new RegExp(`\\s${slug}\\??:\\s(.*?);`);
          const [__, relationType] = targetCollection?.match(fieldRegex) ?? ["", defaultValue];

          if (relationType.match(/^~/)) {
            return resolveType(relationType);
          }

          if (fieldSlugs.length === 1) {
            if (slug.match(/\*$/)) {
              return collection;
            }

            return relationType;
          }

          return walker(`${collection}${delimiter}${fieldSlugs.shift()}`, relationType);
        };

        return walker(collectionName, "any");
      };

      const fieldType = resolveType(match);

      return `${fieldType}${closingChar}`;
    });
  };
