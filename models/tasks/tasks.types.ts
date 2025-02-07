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
  completionTime: number;
}

export interface CategoriesTaskModel {
  id: number;
  label: string;
  description: string;
}

export interface CategoriesTaskModelWithTasks extends CategoriesTaskModel {
  tasks: TaskModel[];
}

export type TaskModelJoinUserTaskStateModel = TaskModel & UserTaskStateModel;

export interface TaskService {
  createUserTaskState: (
    userId: number,
    taskId: number,
    completionTime?: number
  ) => Promise<void>;
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
  getUserLastCompletionTimeForTask: (
    userId: number,
    taskId: number
  ) => Promise<number | null>;
  updateTaskState: (userId: number, taskId: number) => Promise<number>
}
