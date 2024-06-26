'use strict'

module.exports = async function (fastify, opts) {
    fastify.get('/lang/:lang', function (req, reply) {
        reply.sendFile(`/lang/${req.params.lang}`) 
    })  
}