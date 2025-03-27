import { MySQLRowDataPacket } from "@fastify/mysql";
import { QueryResult, FieldPacket } from "mysql2";

export interface DataBaseQueryResult<T = MySQLRowDataPacket> {
  rows: T[];
  fields: FieldPacket[];
}

export interface DataBase {
  insert: <T>(
    query: string,
    values?: any[]
  ) => Promise<DataBaseQueryResult<T> | null>;

  select: <T>(
    query: string,
    values?: any[]
  ) => Promise<DataBaseQueryResult<T> | null>;

  update: <T>(
    query: string,
    values?: any[]
  ) => Promise<DataBaseQueryResult<T> | null>;

  query: <T>(query: string, values?: any[]) => Promise<DataBaseQueryResult<T> | null>;
}
