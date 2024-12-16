import { SkinModel } from "../../models/skinsShop/skins.types";

export interface GetItemsResponse {
  items: ShopItem[];
}

export interface ShopItem extends SkinModel {
  isPurchased: boolean;
}
