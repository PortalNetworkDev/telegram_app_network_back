'use strict'

const fp = require('fastify-plugin')
const csv = require('csv-parser')
const fs = require('fs')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {


    const userTaskState = `
        CREATE TABLE IF NOT EXISTS user_task_state (
            rowid BIGINT NOT NULL AUTO_INCREMENT , PRIMARY KEY (\`rowid\`),
            task_id INTEGER,
            user_id BIGINT,
            is_complite BOOLEAN DEFAULT 0,
            is_rewarded BOOLEAN DEFAULT 0,
            result VARCHAR(255) DEFAULT ""
        )`;

    const categoriesTable = `
        CREATE TABLE IF NOT EXISTS categories_task (
            id BIGINT PRIMARY KEY,
            label VARCHAR(255),
            description TEXT
    )`;

    const tasksTable = `
        CREATE TABLE IF NOT EXISTS tasks (
            id BIGINT PRIMARY KEY,
            title TEXT,
            label TEXT,
            description TEXT , UNIQUE \`description\` (\`description\`(300)),
            type VARCHAR(255),
            category_id INTEGER,
            reward FLOAT,
            icon_url VARCHAR(255),
            other TEXT
    )`;


    const typesTasks = ["selfConfirm", "checkSubscribe", "connectToTon","checkJetton", "checkLiquidity", "referal"]

    await fastify.mysql.insert(userTaskState)
    await fastify.mysql.insert(categoriesTable)
    await fastify.mysql.insert(tasksTable)

    const createCategory = async (id,label, description) => {

        if(await categoryExist(id))
            return true;

        let sql = `INSERT INTO categories_task (id,label, description) VALUES (?,?,?)`;
        let values = [id,label, description];
        await fastify.mysql.insert(sql, values)
    }

    const catImport = async (file) => {

        console.log("RUN catImport")

        const cats = await csvParser(file);
        
        for (let index = 0; index < cats.length; index++) {
            let cat = cats[index];
            try {
                await createCategory(cat.id, cat.label, cat.description);
            } catch (error) {
                //console.log("Error add cat", cat, error)
            }

        }
    }


    const taskImport = async (file) => {

        console.log("RUN taskImport")

        const tasks = await csvParser(file);
        for (let index = 0; index < tasks.length; index++) {
            const {id,title, label, description, type, category_id, reward, icon_url, other} = tasks[index];
            try {
                await createTask(id,title, label, description, type, category_id, reward, icon_url, other)
            } catch (error) {
                
            }

        }
    }



    const csvParser = (file, delimeter = ';') => {

        return new Promise(function(resolve, reject) {
            const results = [];

            fs.createReadStream(file)
            .pipe(csv({ separator: delimeter }))
            .on('data', (data) => {
                results.push(data)

            })
            .on('end', () => {
                resolve(results);
              });
            
        })

    }


    const getCategories = async () => {
        const {rows} = await fastify.mysql.select("select * from categories_task")
        return rows;
    }

    const categoryExist = async (id) => {
        const {rows} = await fastify.mysql.select("select id from categories_task where id = ?",[id])
        if(rows.length){
            return true;
        }else{
            return false;
        }
    }

    const taskExist = async (id) => {
        const {rows} = await fastify.mysql.select("select id from tasks where id = ?",[id])
        
        if(rows.length){
            return true;
        }else{
            return false;
        }
    }


    const createTask = async (id,title, label, description, type, category_id, reward, icon_url, other) => {

        if(!await categoryExist(category_id))
            throw "category_does_not_exist";

        if(!typesTasks.includes(type))
            throw "type_does_not_exist";

        if(await taskExist(id))
            return true;

        let sql = `INSERT INTO tasks (id,title, label, description, type, category_id, reward, icon_url, other) 
        VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)`;
        let values = [id,title,label,description,type,category_id,reward,icon_url,other];

        await fastify.mysql.insert(sql,values)
    }

    const getTasks = async () => {
        const {rows} = await fastify.mysql.select("select * from tasks")
        return rows;
    }


    const getUserTasks = async (user_id, where = "") => {

        
        try {
            
            const {rows} = await fastify.mysql.select(`select  
            user_task_state.is_complite as is_complite,
            user_task_state.is_rewarded as is_rewarded,
            user_task_state.result as result,
            user_task_state.rowid as id,
            tasks.title as title,
            tasks.label as label,
            tasks.description as description,
            tasks.type as type,
            tasks.category_id as category_id,
            tasks.reward as reward,
            tasks.icon_url as icon_url,
            tasks.other as other

            from tasks JOIN user_task_state on tasks.id = user_task_state.task_id where user_task_state.user_id = ? ${where}`,[user_id])
            
            return rows;
        } catch (error) {
            console.log(error)
            return [];
        }

    }

    const getUserTask = async (user_id, task_id) => {

        
        try {
            
            const {rows} = await fastify.mysql.select(`select  
            user_task_state.is_complite as is_complite,
            user_task_state.is_rewarded as is_rewarded,
            user_task_state.result as result,
            user_task_state.rowid as id,
            tasks.title as title,
            tasks.label as label,
            tasks.description as description,
            tasks.type as type,
            tasks.category_id as category_id,
            tasks.reward as reward,
            tasks.icon_url as icon_url,
            tasks.other as other

            from tasks JOIN user_task_state on tasks.id = user_task_state.task_id where user_task_state.user_id = ? and user_task_state.rowid = ?`,[user_id, task_id])
            console.log(rows)
            return rows[0];
        } catch (error) {
            console.log(error)
            return [];
        }

    }

    const getUserTaskByTaskId = async (user_id, task_id) => {

        
        try {
            
            const {rows} = await fastify.mysql.select(`select  
            user_task_state.is_complite as is_complite,
            user_task_state.is_rewarded as is_rewarded,
            user_task_state.result as result,
            user_task_state.rowid as id,
            tasks.title as title,
            tasks.label as label,
            tasks.description as description,
            tasks.type as type,
            tasks.category_id as category_id,
            tasks.reward as reward,
            tasks.icon_url as icon_url,
            tasks.other as other

            from tasks JOIN user_task_state on tasks.id = user_task_state.task_id where user_task_state.user_id = ? and user_task_state.task_id = ?`,[user_id, task_id])
            console.log(rows)
            return rows[0];
        } catch (error) {
            console.log(error)
            return [];
        }

    }



    const createUserTaskStates = async (user_id) => {
        const tasks = await getTasks();



        for (let index = 0; index < tasks.length; index++) {
            const task = tasks[index];

            await createUserTaskState(user_id, task.id)
            
        }

    }

    const createUserTaskState = async (user_id, task_id) => {
        
        let sql = `INSERT INTO user_task_state (user_id, task_id) VALUES (?,?)`
        await fastify.mysql.insert(sql,[user_id, task_id])

    }

    const getUserTasksState = async (user_id) => {
        const [rows] =  await fastify.mysql.select("select * from user_task_state where user_id = ?",[user_id])
        return rows;
    }

    const compliteTask = async (id, user_id, result) => {
        console.log("compliteTask", id, user_id, result)
        const tasks = await fastify.mysql.update("update user_task_state set result = ?, is_complite = 1 where rowid = ? and user_id = ?",[result, id, user_id])
        return tasks;
    }

    const setRewardedTask = async (id, user_id, result) => {
        console.log("setRewardedTask", id, user_id, result)
        const tasks = await fastify.mysql.update("update user_task_state set result = ?, is_rewarded = 1 where rowid = ? and user_id = ?",[result, id, user_id])
        return tasks;
    }

    fastify.decorate("models_tasks",{
        createUserTaskState,
        getUserTasksState,
        compliteTask,
        createCategory,
        createTask,
        getCategories,
        categoryExist,
        getUserTasks,
        getUserTask,
        createUserTaskStates,
        setRewardedTask,
        getUserTaskByTaskId
    })


    await catImport("./db/catsimport.csv")
    await taskImport("./db/tasksimport.csv")
    
    
})
