'use strict'

module.exports = async function (fastify, opts) {
    fastify.get('/html/:html', function (req, reply) {
        reply.sendFile(`/html/${req.params.html}`) 
    })  
}