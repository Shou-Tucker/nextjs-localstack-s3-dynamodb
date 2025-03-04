# Next.js with LocalStack S3 & DynamoDB

MacBook上でDockerを使用してLocalStackとNext.jsアプリケーションを連携させるデモプロジェクトです。このアプリケーションでは以下の機能を実装しています：

- LocalStackのS3への画像ファイルのアップロード
- アップロードした画像のメタデータをDynamoDBに保存
- S3とDynamoDBから画像とメタデータを取得して一覧表示
- 画像の削除機能（S3とDynamoDBの両方から削除）

## 使用技術

- Next.js 14
- TypeScript
- Tailwind CSS
- LocalStack
- AWS SDK for JavaScript (S3 & DynamoDB)
- Docker & Docker Compose

## プロジェクト構成

```
.
├── docker-compose.yml         # Docker設定ファイル
├── init-scripts/              # LocalStack初期化スクリプト
└── next-app/                  # Next.jsアプリケーション
    ├── app/                   # Next.jsアプリのルート
    │   ├── api/               # APIエンドポイント
    │   │   ├── images/        # 画像一覧・削除API
    │   │   └── upload/        # アップロードAPI
    │   ├── globals.css        # グローバルスタイル
    │   ├── layout.tsx         # レイアウトコンポーネント
    │   └── page.tsx           # メインページ
    ├── components/            # Reactコンポーネント
    │   ├── ImageGallery.tsx   # 画像ギャラリー
    │   └── UploadForm.tsx     # アップロードフォーム
    ├── types/                 # 型定義
    ├── utils/                 # ユーティリティ
    │   └── aws-config.ts      # AWS設定
    ├── Dockerfile             # Next.jsのDockerfile
    ├── package.json           # 依存関係
    └── ...                    # その他設定ファイル
```

## 開始方法

1. リポジトリをクローンします：

```bash
git clone https://github.com/yourusername/nextjs-localstack-s3-dynamodb.git
cd nextjs-localstack-s3-dynamodb
```

2. Docker Composeで環境を起動します：

```bash
docker-compose up -d
```

3. ブラウザで `http://localhost:3000` にアクセスしてアプリケーションを使用します。

## 機能詳細

### 画像アップロード

- 画像ファイルを選択してアップロードフォームから送信
- 画像はLocalStackのS3バケット `images-bucket` に保存
- 画像のメタデータ（ファイル名、サイズ、タイプ、URL）はDynamoDBテーブル `images-table` に保存

### 画像ギャラリー

- アップロードした画像の一覧を表示
- サムネイルをクリックすると拡大表示
- 各画像の詳細情報（アップロード日時、サイズ、タイプ）を表示
- 画像の削除機能

## LocalStackリソース

- **S3バケット**: `images-bucket`
- **DynamoDBテーブル**: `images-table`

LocalStackの管理コンソールには `http://localhost:4566` でアクセスできます。

## 環境変数

Docker Compose内で以下の環境変数を設定しています：

- `AWS_ENDPOINT=http://localstack:4566`
- `AWS_REGION=ap-northeast-1`
- `AWS_ACCESS_KEY_ID=test`
- `AWS_SECRET_ACCESS_KEY=test`
- `BUCKET_NAME=images-bucket`
- `TABLE_NAME=images-table`

## 注意点

- このアプリケーションはデモ用であり、本番環境での使用は想定していません
- LocalStackはAWSのローカルエミュレーターであり、一部のAWS機能に制限があります
- Docker環境が必要です
