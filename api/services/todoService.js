const List = require('../models/Lists')

/**
 * 
 * @param {lists} list object
 * @returns a new list
 */
const createtodo = (list) => {
    return List.create(list)
}

const getTodoByListAndUserId = (id, listid) => {
    return List.findOne({ where: { id: listid, userId: id} })
}

const getTodosByUsername = (id) => {
    return List.findAll({ where: { userId: id} })
}

const getTodoById = (todoId) => {
    return List.findOne({ where: {id: todoId} })
}

const deleteTodoById = (todoId) => {
    return List.destroy({ where: { id: todoId } })
}

const modifyTodoList = (id, listname) => {
    // return list.save()
    return List.update({listname},{where: { id: id }});
}

module.exports = { createtodo, getTodosByUsername, getTodoByListAndUserId, getTodoById, deleteTodoById, modifyTodoList }