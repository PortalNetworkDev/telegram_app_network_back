import { DataBaseQueryResult } from "../../plugins/mysql/mysql.types";

export interface TaskModel {
  id: number;
  title: string;
  label: string;
  description: string;
  type: string;
  category_id: number;
  reward: number;
  icon_url: string;
  other: string;
}

export interface UserTaskStateModel {
  rowid: number;
  task_id: number;
  user_id: number;
  is_complite: boolean;
  is_rewarded: boolean;
  result: string;
}

export interface CategoriesTaskModel {
  id: number;
  label: string;
  description: string;
}

export interface CategoriesTaskModelWithTasks extends CategoriesTaskModel {
  tasks: TaskModel[];
}

export type TaskModelJoinUserTaskStateModel = TaskModel &
  UserTaskStateModel & { isActive: boolean; rewardUnit: string };

export interface TaskService {
  createUserTaskState: (userId: number, taskId: number) => Promise<void>;
  compliteTask: (
    id: number,
    userId: number,
    result: string
  ) => Promise<DataBaseQueryResult<TaskModel> | null>;

  createCategory: (
    id: number,
    label: string,
    description: string
  ) => Promise<true | undefined>;

  createTask: (
    id: number,
    title: string,
    label: string,
    description: string,
    type: string,
    category_id: number,
    reward: number,
    icon_url: string,
    other: string
  ) => Promise<true | undefined>;

  getCategories: () => Promise<CategoriesTaskModel[] | null>;

  categoryExist: (id: number) => Promise<boolean>;

  getUserTasks: (
    userId: number,
    where?: string
  ) => Promise<TaskModelJoinUserTaskStateModel[] | null>;
  getUserTask: (userId: number, taskId: number) => Promise<TaskModel | null>;
  createUserTaskStates: (userId: number) => Promise<void>;
  setRewardedTask: (
    id: number,
    userId: number,
    result: string
  ) => Promise<DataBaseQueryResult<UserTaskStateModel> | null>;

  getUserTaskByTaskId: (
    userId: number,
    taskId: number
  ) => Promise<TaskModel | null>;

  getAllTasks: () => Promise<DataBaseQueryResult<TaskModel> | null>;
  reimportCat: () => Promise<void>;
  reimportTasks: () => Promise<void>;
  resetTaskState: (id: number, userId: number) => Promise<void>;
  updateTaskState: (userId: number, taskId: number) => Promise<number>;
  getIsUserCompleteTask: (userId: number, taskId: number) => Promise<boolean>;
}
