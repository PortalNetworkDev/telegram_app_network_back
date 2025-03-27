export interface NftForLottery {
  id: number;
  nftCollectionAddress: string;
  nftAddress: string;
  isHasWinner: boolean;
  winnerUserId: number;
  wasSended: boolean;
}

export interface NftForLotteryService {
  getAllNftsWithoutWinner: () => Promise<NftForLottery[] | null>;
  setWinnerForNft: (userId: number, nftId: number) => Promise<void>;
  setIsNftSendToWinnerUser: (nftId: number) => Promise<void>
}
