import type { Collection } from "./fields";
import type { NetlifyMediaLibrary } from "./media-library";

export interface NetlifyCMSConfig {
  collections: Collection[];
  media_library?: NetlifyMediaLibrary;
}
