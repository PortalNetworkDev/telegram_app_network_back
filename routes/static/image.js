'use strict'

module.exports = async function (fastify, opts) {
    fastify.get('/images/:image', function (req, reply) {
        reply.sendFile(`/images/${req.params.icon}`) 
    })  
}