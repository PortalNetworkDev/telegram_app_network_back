import createPlugin from "fastify-plugin";
import { getTimePeriodSQLCondition, transformSqlRowToTransactionData, transformTransactionHistoryItemData } from "./utils/utils.js";
export default createPlugin(async function (fastify, ops) {
    const createTable = `  
    CREATE TABLE IF NOT EXISTS transactions (
            id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            sender_id BIGINT NOT NULL,
            recipient_id BIGINT NOT NULL,
            power_amount FLOAT NOT NULL,
            comment TEXT,
            creation_time BIGINT NOT NULL
        );`;
    await fastify.dataBase.query(createTable);
    const addTransaction = async (data) => {
        const sql = "INSERT INTO transactions (sender_id,recipient_id,power_amount,comment,creation_time) VALUES (?,?,?,?,?)";
        fastify.dataBase.insert(sql, [
            data.senderId,
            data.recipientId,
            data.powerAmount,
            data.comment ?? null,
            data.creationTime,
        ]);
    };
    const getTransactionById = async (id) => {
        const sql = "SELECT * from transactions WHERE id =?";
        const result = await fastify.dataBase.select(sql, [id]);
        if (result?.rows[0]) {
            return transformSqlRowToTransactionData(result?.rows[0]);
        }
        return null;
    };
    const getTransactionsByUserId = async (id, limit = 20, offset = 0) => {
        const sql = `SELECT * from transactions WHERE sender_id =? OR recipient_id=? limit ${limit} offset ${offset}`;
        const result = await fastify.dataBase.select(sql, [id, id]);
        if (result?.rows) {
            return result.rows.map((item) => transformSqlRowToTransactionData(item));
        }
        return [];
    };
    const getTransactionsByUserIdAndTime = async (id, timePeriod, limit = 20, offset = 0) => {
        const period = getTimePeriodSQLCondition(timePeriod);
        const sql = `SELECT * from transactions WHERE sender_id =? OR recipient_id=? AND ${period} limit ${limit} offset ${offset}`;
        const result = await fastify.dataBase.select(sql, [id, id]);
        if (result?.rows) {
            const [{ username: senderUserName }, { username: recipientUserName }] = await Promise.all([
                // @ts-ignore: Unreachable code error
                fastify.models_user.getUser(result?.rows[0].sender_id),
                // @ts-ignore: Unreachable code error
                fastify.models_user.getUser(result?.rows[0].recipient_id),
            ]);
            return result.rows.map((item) => transformTransactionHistoryItemData(item, senderUserName, recipientUserName));
        }
        return [];
    };
    fastify.decorate("transactions", {
        addTransaction,
        getTransactionById,
        getTransactionsByUserId,
        getTransactionsByUserIdAndTime,
    });
});
