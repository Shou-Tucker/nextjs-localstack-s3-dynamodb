import { NextRequest, NextResponse } from 'next/server';
import { s3, dynamoDb, bucketName, tableName } from '@/utils/aws-config';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイルのバイナリデータを取得
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    
    // 一意のIDを生成
    const id = uuidv4();
    const fileKey = `${id}-${file.name}`;
    
    // S3にアップロード
    const s3Result = await s3.upload({
      Bucket: bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    }).promise();
    
    // ファイル情報をDynamoDBに保存
    const item = {
      id,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      url: s3Result.Location.replace('localstack:4566', 'localhost:4566'),
    };
    
    await dynamoDb.put({
      TableName: tableName,
      Item: item,
    }).promise();
    
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('アップロードエラー:', error);
    return NextResponse.json(
      { success: false, error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
