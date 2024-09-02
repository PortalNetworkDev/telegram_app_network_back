const TonWeb = require('tonweb');

module.exports = async function (fastify, opts) {
    fastify.post('/selfConfirm', 
    {schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' }
            }
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: {
                error: { type: 'string' },
                message: { type: 'string',enum:["incorrect_type"] },
            }   
          },
        },
        body: {
          type: 'object',
          properties: {
            task_id: { type: 'number', minimum:1 },
            result: { type: 'string', minLength: 1 }
          },
          required: ['task_id', 'result']
        }
    },
    onRequest: [fastify.auth]
    }, 
    async function (request, reply) {
        
        const { task_id, result } = request.body
        await fastify.utils.sleep(100)
      
        const user = fastify.getUser(request)
        const task = await fastify.models_tasks.getUserTask(user.id, task_id);
        
        if(!task){
          return reply.badRequest(`task_not_found ${user.id}, ${task_id}`);
        }

        if(!["selfConfirm","connectToTon"].includes(task.type))
          return reply.badRequest("incorrect_type");

        if(task.type == "connectToTon"){
          if(!TonWeb.utils.Address.isValid(result) && result!="disconnect"){
            return reply.badRequest("incorrect_address");
          }

          const addressUsed = await fastify.models_user.sameWalletExist(user.id, result);
          
          if (addressUsed) {
            return reply.badRequest("address_already_used");
          }

          if (result == "disconnect"){
            await fastify.models_user.updateWallet(user.id, "");
          }else{
            await fastify.models_user.updateWallet(user.id, result);
          }
        }
        
        await fastify.models_tasks.compliteTask(task_id,user.id,result)

        

        return {code:"succcess"}

    })
  }