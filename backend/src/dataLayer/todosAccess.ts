// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
var AWSXRay = require('aws-xray-sdk')
var AWS = require('aws-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly doc_client: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todos_table = process.env.TODOS_TABLE,
    private readonly todos_index = process.env.INDEX_NAME
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Start all todos function')
    const result = await this.doc_client
      .query({
        TableName: this.todos_table,
        IndexName: this.todos_index,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Start create todo')

    const result = await this.doc_client
      .put({ TableName: this.todos_table, Item: todoItem })
      .promise()

    logger.info('Todo created', result)
    return todoItem as TodoItem
  }

  async updateTodoItem(
    todoId: string,
    userId: string,
    todoUpdate: UpdateTodoRequest
  ): Promise<TodoUpdate> {
    logger.info('Start update item function')
    const updatedTodo = await this.doc_client
      .update({
        TableName: this.todos_table,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()
    return updatedTodo.Attributes as TodoUpdate
  }

  async deleteTodoItem(todoId: string, userId: string): Promise<string> {
    logger.info('Start delete item')

    const deleteItem = await this.doc_client
      .delete({
        TableName: this.todos_table,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
    logger.info('item deleted: ', deleteItem)
    return todoId
  }

  async updateTodoAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentUrl: string
  ): Promise<void> {
    logger.info('Start update attachment url')

    await this.doc_client
      .update({
        TableName: this.todos_table,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
  }
}
