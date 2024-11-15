export default async function (fastify) {
    fastify.post("/history", async (request, response) => {
        const { limit, page, timePeriod, userId } = request.body;
        const result = await fastify.transactions.getTransactionsByUserIdAndTime(userId, timePeriod, limit, page * limit);
        return result;
    });
    fastify.get("/getTransactionById", async (request, replay) => {
        const transaction = await fastify.transactions.getTransactionById(request.query.id);
        return transaction;
    });
    fastify.get("/getTransactionsByUserId", async (request, replay) => {
        const transactions = await fastify.transactions.getTransactionsByUserId(request.query.id);
        return transactions;
    });
}
