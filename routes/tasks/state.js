'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/mystate',{onRequest: [fastify.auth]}, async function (request, reply) {
    
    const user = fastify.getUser(request)
    const cats = await fastify.models_tasks.getCategories();
    const tasks = await fastify.models_tasks.getUserTasks(user.id);


    for (let indexCat = 0; indexCat < cats.length; indexCat++) {
      const cat = cats[indexCat];

      
      
      cats[indexCat].tasks = []

      for (let index = 0; index < tasks.length; index++) {
        const task = tasks[index];

        if(task.reward < 1 )
          task.reward = Number(Number(task.reward).toFixed(1))

        if(task.category_id == cat.id){
          cats[indexCat].tasks.push(task)
        }
      }
      
    }
    return cats;
  })
}
