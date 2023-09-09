import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const logger = createLogger('TodosAccesss')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

// Get todo function
export async function getTodosForUser(userId: string) {
  logger.info('Get todos user with params', userId)
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

// Update todo function
export async function updateTodo(
  userId: string,
  todoId: string,
  todoUpdate: UpdateTodoRequest
): Promise<TodoUpdate> {
  logger.info('Start update todo function')
  return todosAccess.updateTodoItem(todoId, userId, todoUpdate)
}

// Delete todo function
export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<string> {
  logger.info('Start detele todo function')
  return todosAccess.deleteTodoItem(todoId, userId)
}

// create url img of todo function
export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
): Promise<string> {
  logger.info(
    `Start create Attachment Presigned Url todo function: ${userId} & ${todoId}`
  )
  const url = attachmentUtils.getUploadUrl(todoId)
  return url as string
}
