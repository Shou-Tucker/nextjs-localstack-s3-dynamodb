import { NextRequest, NextResponse } from 'next/server';
import { s3, dynamoDb, bucketName, tableName } from '@/utils/aws-config';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // DynamoDBから該当するエントリーを取得
    const result = await dynamoDb.get({
      TableName: tableName,
      Key: { id },
    }).promise();

    if (!result.Item) {
      return NextResponse.json(
        { success: false, error: '指定されたIDの画像が見つかりません' },
        { status: 404 }
      );
    }

    // S3から画像を削除
    const fileKey = `${id}-${result.Item.filename}`;
    await s3.deleteObject({
      Bucket: bucketName,
      Key: fileKey,
    }).promise();

    // DynamoDBからエントリーを削除
    await dynamoDb.delete({
      TableName: tableName,
      Key: { id },
    }).promise();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('削除エラー:', error);
    return NextResponse.json(
      { success: false, error: '画像の削除に失敗しました' },
      { status: 500 }
    );
  }
}
