export interface SkinModel {
  id: number;
  price: number;
  imageUrl: string;
  name: string;
  type: number;
}

export interface PurchasedSkinsModel {
  id: number;
  userId: number;
  skinId: number;
  creationTime: number;
}

export enum SkinType {
  generator,
  battery,
}

export interface SkinShopService {
  addPurchasedSkin: (userId: number, skinId: number) => Promise<void>;
  getAllSkins: () => Promise<SkinModel[] | null>;
  getAllBoughtSkinsForUser: (
    userId: number
  ) => Promise<PurchasedSkinsModel[] | null>;
  getAllSkinsForUser: (
    userId: number,
    skinType: keyof typeof SkinType
  ) => Promise<SkinModel[] | null>;
  getInfoAboutSkin: (skinId: number) => Promise<SkinModel | null>;
  getAllSkinsByType: (
    skinType: keyof typeof SkinType
  ) => Promise<SkinModel[] | null>;
}
