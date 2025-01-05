export interface TopMinerListItemModel {
  id: number;
  userId: number;
  powerBalance: number;
}

export interface TopMinerListService {
  getUserCurrentPosition: (userId: number) => Promise<number | null>;
  getUsersFromList: (
    page: number,
    limit?: number
  ) => Promise<TopMinerListItemModel[] | null>;
  getMinersListLength: () => Promise<number>;
}
