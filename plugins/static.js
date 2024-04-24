'use strict'

const fp = require('fastify-plugin')
const path = require('node:path')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {
    
    fastify.register(require('@fastify/static'), {
      root: path.join(__dirname, '../assets'),
      //prefix: '/public/', // optional: default '/'
      //constraints: { host: 'example.com' } // optional: default {}
    })
    
})
