'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/mystate',{onRequest: [fastify.auth]}, async function (request, reply) {
    
    const user = await fastify.models_user.getUser(fastify.getUser(request).id)
    const cats = await fastify.models_tasks.getCategories();
    const tasks = await fastify.models_tasks.getUserTasks(user.id);
    const en_cats = await fastify.utils.csvParser("./db/catstranslate_en.csv")
    const en_tasks = await fastify.utils.csvParser("./db/taskstranslate_en.csv")
    const subscribeUsersText = (user.language_code == "ru") ? "Привлечено пользователей": "Users attracted";
    const daysInPoolText = (user.language_code == "ru") ? "Дней в пуле": "Days in the pool";


    for (let indexCat = 0; indexCat < cats.length; indexCat++) {
      const cat = cats[indexCat];

      if(user.language_code != "ru"){
        cat.description = en_cats[indexCat].description;
        cat.label = en_cats[indexCat].label;
      }


      
      cats[indexCat].tasks = []

      for (let index = 0; index < tasks.length; index++) {
        const task = tasks[index];

        if(user.language_code != "ru"){
          task.label = en_tasks[index].label;
          task.description = en_tasks[index].description;
          task.title = en_tasks[index].title;
          task.other = en_tasks[index].other;
        }

        if(task.category_id == cat.id){
          
          if(task.type == "referal"){
            task.description = task.description+`<br><br>${subscribeUsersText}: <b>${await fastify.models_user.countReferalUsers(user.id)}</b>`
            task.reward = user.referal_reward
          }

          if(task.reward < 1 )
            task.reward = Number(Number(task.reward).toFixed(2))

          if(task.type == "checkLiquidity"){
            const days = await fastify.models_balance_history.getHoleInHistoryPoolBalance(user.id);
            task.description = task.description+`<br><br>${daysInPoolText}: <b>${days.length}</b>`
          }

          cats[indexCat].tasks.push(task)
        }
      }
      
    }
    
    return cats;
  })
}
