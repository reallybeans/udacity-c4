import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const s3_bucket_name = process.env.ATTACHMENT_S3_BUCKET
const url_exp = process.env.SIGNED_URL_EXPIRATION

export class AttachmentUtils {
  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly bucket_name = s3_bucket_name
  ) {}

  getAttachmentUrl(todo_id: string) {
    return `https://${this.bucket_name}.s3.amazonaws.com/${todo_id}`
  }

  getUploadUrl(todo_id: string) {
    const url = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucket_name,
      Key: todo_id,
      Expires: url_exp
    })
    return url as string
  }
}
