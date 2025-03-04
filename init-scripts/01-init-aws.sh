#!/bin/bash

# S3バケットの作成
echo "Creating S3 bucket..."
awslocal s3 mb s3://images-bucket

# バケットのCORSを設定
echo "Configuring CORS for S3 bucket..."
awslocal s3api put-bucket-cors --bucket images-bucket --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": []
    }
  ]
}'

# DynamoDBテーブルの作成
echo "Creating DynamoDB table..."
awslocal dynamodb create-table \
  --table-name images-table \
  --attribute-definitions \
      AttributeName=id,AttributeType=S \
  --key-schema \
      AttributeName=id,KeyType=HASH \
  --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5

echo "AWS resources initialization completed!"
