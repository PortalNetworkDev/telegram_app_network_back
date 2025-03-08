export interface NftHolderModel {
  id: number;
  userId: number;
  userWallerAddress: string;
  nftAddress: string;
  isRewarded: boolean;
}

export interface NftHolderService {
  addNftHolder: (
    userId: number | null,
    userWallerAddress: string,
    nftAddress: string
  ) => Promise<void>;
}
