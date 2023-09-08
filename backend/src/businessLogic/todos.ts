import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const logger = createLogger('TodosAccesss')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

// Get todo function
export async function getTodosForUser(userId: string) {
  logger.info('Get todos user with params {}', userId)
  return todosAccess.getAllTodos(userId)
}

// Create todo function
export async function createTodo(
  new_todo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('Start create todo function')

  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const s3_attachment_url = attachmentUtils.getAttachmentUrl(todoId)
  const new_item = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: s3_attachment_url,
    ...new_todo
  }
  return await todosAccess.createTodoItem(new_item)
}
