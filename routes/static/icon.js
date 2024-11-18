'use strict'

export default async function (fastify, opts) {
    fastify.get('/icon/:icon', function (req, reply) {
        reply.sendFile(`/icons/${req.params.icon}`) 
    })  
}