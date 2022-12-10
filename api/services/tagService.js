const Tag = require('../models/Tags')
const TaskTag = require('../models/TaskTags')
const logger = require('simple-node-logger').createSimpleLogger();
// const { getTodosByUsername } = require('./tagService')

/**
 * 
 * @param {tags} tags object
 * @returns a new tag
 */

const getAllUserTags = (id) => {
    return Tag.findAll({ where: { userId: id } })
}

const getAllTaskTags = taskid => {
    return TaskTag.findAll({ where: { taskId: taskid } })
}

const getTagDetailsById = tagid => {
    return Tag.findOne({ where: { id: tagid } })
}

const addtag = async (tag) => {
    const allUserTags = await getAllUserTags(tag.userId)
    console.log("All tags are as follows")
    // console.log(allUserTags)

    if (!allUserTags) {
        logger.info("----------No User tags found----------")
        return false
    }
    
    let isTagPresent = false;
    allUserTags.forEach(function (utag) {
        console.log(utag.name)
        // check if tag present
        if (utag.name === tag.name) {
            isTagPresent = true
            // logger.info(`----------Tag ${utag.name} is present, skipping----------`)
        }
    });

    if (isTagPresent) {
        logger.info(`----------Tag ${tag.name} is present, skipping----------`)
        return false
    }
    
    const createTag = await Tag.create(tag)
    
    return createTag
}

const addtasktag = async (tasktag) => {
    const allUserTags = await getAllUserTags(tasktag.userId)
    console.log("new user tags")
    // console.log(allUserTags)
    let tTag = {taskId: tasktag.taskId, tagId: ''}

    allUserTags.forEach(function (utag) {
        // check if tag present
        if (utag.name === tasktag.name) {
            tTag.tagId = utag.id
            // logger.info(`----------Tag ${utag.name} is present, skipping----------`)
        }
    });

    const allTaskTags = await getAllTaskTags(tasktag.taskId)
    console.log("All task tags idddddddddddddddddddddd")
    // console.log(allTaskTags)

    let isTagPresent = false;
    allTaskTags.forEach(function (ttag) {
        // check if tag present
        if (ttag.tagId === tTag.tagId) {
            isTagPresent = true
            // logger.info(`----------Tag ${utag.name} is present, skipping----------`)
        }
    });

    if (isTagPresent) {
        logger.info(`///----------Task Tag is present, skipping----------/////`)
        return false
    }
    else if (allTaskTags.length === 10) {
        logger.info(`Maximum tag limit of 10 reached`)
        return "Limit Reached"
    }
    else {
        return TaskTag.create(tTag)
    }

    


    // if (allUserTags.tags?.name === tasktag.name) {
    //     console.log("///////////")
    //     console.log(allUserTags.tags?.name)
    // }

}

const getTagByNameAndId = (userid, name) => {
    return Tag.findOne({
        where: {
            userId: userid,
            name: name
        }
    })
}


const modifyTag = async (userid, tag) => {  

    const findTag = await getTagByNameAndId(userid, tag.newtagname)

    if (!findTag) {
        return Tag.update({
            name: tag.newtagname
        }, {
            where: { 
                userId: userid,
                name: tag.tagname
            }
        })
    } else {
        return false
    }
    // return updateTag;
}

const deleteTaskTagByIds= (taskid, tagid) => {
    return TaskTag.destroy({ 
        where: { 
            taskId: taskid,
            tagId: tagid
        }
    })
}

module.exports = { addtag, addtasktag, getAllUserTags, modifyTag, getTagByNameAndId, getAllTaskTags, getTagDetailsById, deleteTaskTagByIds }