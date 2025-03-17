export interface VsFile {
  type?: string | null;
  fileId?: string | null;
}

export enum FileTypes {
  SHOP = "shop",
  PRODUCTS = "produts",
  ORDES = "orders",
  OTHER_INFO = "other-info",
}
