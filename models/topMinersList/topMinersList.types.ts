export interface TopMinerListItemModel {
  id: number;
  userId: number;
  powerBalance: number;
  level: number;
}

export interface TopMinerListItemModelWithUserName
  extends TopMinerListItemModel {
  firstName: string;
  lastName: string;
}

export interface TopMinerListService {
  getUserCurrentPosition: (userId: number) => Promise<number | null>;
  getUsersFromList: (
    page: number,
    limit?: number
  ) => Promise<TopMinerListItemModelWithUserName[] | null>;
  getMinersListLength: () => Promise<number>;
}
