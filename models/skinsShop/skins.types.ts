import { DataBaseQueryResult } from "../../plugins/mysql/mysql.types";

export interface SkinModel {
  id: number;
  price: number;
  imageUrl: string;
  name: string;
}

export interface PurchasedSkinsModel {
  id: number;
  userId: number;
  skinId: number;
  creationTime: number;
}

export interface SkinShopService {
  addPurchasedSkin: (userId: number, skinId: number) => Promise<void>;
  getAllSkins: () => Promise<SkinModel[] | null>;
  getAllBoughtSkinsForUser: (
    userId: number
  ) => Promise<PurchasedSkinsModel[] | null>;
  getAllSkinsForUser: (userId: number) => Promise<SkinModel[] | null>;
  getInfoAboutSkin: (skinId: number) => Promise<SkinModel[] | null>;
}
