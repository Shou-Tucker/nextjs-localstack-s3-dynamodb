import AWS from 'aws-sdk';

// 環境変数を取得し、デフォルト値を設定
const awsEndpoint = process.env.AWS_ENDPOINT || 'http://localhost:4566';
const region = process.env.AWS_REGION || 'ap-northeast-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'test';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || 'test';
const bucketName = process.env.BUCKET_NAME || 'images-bucket';
const tableName = process.env.TABLE_NAME || 'images-table';

// AWS設定
const awsConfig = {
  endpoint: awsEndpoint,
  region: region,
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  s3ForcePathStyle: true,
};

// S3クライアント
export const s3 = new AWS.S3(awsConfig);

// DynamoDBクライアント
export const dynamoDb = new AWS.DynamoDB.DocumentClient(awsConfig);

export { bucketName, tableName };
