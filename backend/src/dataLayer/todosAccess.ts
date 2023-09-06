// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
var AWSXRay = require('aws-xray-sdk')
var AWS = require('aws-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly doc_client: DocumentClient = new XAWS.DynamoDB.DocmentClient(),
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
    todo_id: string,
    user_id: string,
    todo_update: TodoUpdate
  ): Promise<TodoUpdate> {
    logger.info('Start update item function')
    await this.doc_client
      .update({
        TableName: this.todos_table,
        Key: {
          todo_id,
          user_id
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueName, done = :done',
        ExpressionAttributeValues: {
          ':name': todo_update.name,
          ':dueDate': todo_update.dueDate,
          ':done': todo_update.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        }
      })
      .promise()
    return todo_update
  }
  async deleteTodoItem(todo_id: string, user_id: string): Promise<void> {
    logger.info('Start delete item')

    await this.doc_client
      .delete({
        TableName: this.todos_table,
        Key: {
          todo_id,
          user_id
        }
      })
      .promise()
  }
  async updateTodoAttachmentUrl(
    todo_id: string,
    user_id: string,
    attachmentUrl: string
  ): Promise<void> {
    logger.info('Start update attachment url')

    await this.doc_client
      .update({
        TableName: this.todos_table,
        Key: {
          todo_id,
          user_id
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
  }
}
