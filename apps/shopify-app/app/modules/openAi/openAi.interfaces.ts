export interface VsFile {
  type?: string | null;
  fileId?: string | null;
}

export enum FileTypes {
  SHOP = "shop",
  PRODUCTS = "produts",
  LOCATIONS = "locatinos",
  // OTHER_INFO = "other-info",
}
