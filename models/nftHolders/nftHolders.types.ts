export interface NftHolderModel {
  id: number;
  userId: number;
  userWallerAddress: string;
  nftAddress: string;
  isRewarded: boolean;
}

export interface NftCollectionsModel {
  id: number;
  nftCollectionAddress: string;
  rewardForOneItem: number;
}

export interface NftHolderService {
  addNftHolder: (
    userId: number | null,
    userWallerAddress: string,
    nftAddress: string,
    collectionId: number
  ) => Promise<void>;

  getAllNFTCollectionData: () => Promise<NftCollectionsModel[] | null>;
  truncateTable: () => Promise<void>;
}
