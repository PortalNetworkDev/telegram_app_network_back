import Schema from "fluent-json-schema";
const params = Schema.object()
    .prop("timePeriod", Schema.object())
    .prop("page", Schema.number())
    .prop("limit", Schema.number());
const schema = { params };
export default async function (fastify) {
    fastify.post("/history", 
    // @ts-ignore: Unreachable code error
    { schema, onRequest: [fastify.auth] }, async (request, response) => {
        const { limit, page, timePeriod } = request.body;
        // @ts-ignore: Unreachable code error
        const userId = fastify.getUser(request).id;
        const returnedRowsLimit = limit > 50 ? 50 : limit;
        const result = await fastify.transactions.getTransactionsByUserIdAndTime(userId, timePeriod, returnedRowsLimit, page * returnedRowsLimit);
        return result;
    });
    fastify.get("/getTransactionById", async (request, replay) => {
        const transaction = await fastify.transactions.getTransactionById(request.query.id);
        return transaction;
    });
}
