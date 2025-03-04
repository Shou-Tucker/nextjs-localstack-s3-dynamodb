import { NextResponse } from 'next/server';
import { dynamoDb, tableName } from '@/utils/aws-config';

export async function GET() {
  try {
    // DynamoDBからすべての画像エントリーを取得
    const result = await dynamoDb.scan({
      TableName: tableName,
    }).promise();
    
    // アップロード日時の降順でソート
    const sortedItems = result.Items?.sort((a, b) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }) || [];
    
    return NextResponse.json({ success: true, data: sortedItems });
  } catch (error) {
    console.error('画像一覧取得エラー:', error);
    return NextResponse.json(
      { success: false, error: '画像一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
