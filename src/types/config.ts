import type { Collection } from "./fields.js";
import type { NetlifyMediaLibrary } from "./media-library.js";

export interface NetlifyCMSConfig {
  collections: Collection[];
  media_library?: NetlifyMediaLibrary;
}
