'use strict'

import { FastifyInstance } from "fastify"

export default async function (fastify:FastifyInstance) {
    fastify.get<{Params: {html:string}}>('/html/:html', function (req, reply) {
        
        reply.sendFile(`/html/${req.params.html}`) 
    })  
}