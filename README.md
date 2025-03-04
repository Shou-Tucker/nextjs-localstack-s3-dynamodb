# Next.js with LocalStack S3 & DynamoDB

MacBook上でDockerを使用してLocalStackとNext.jsアプリケーションを連携させるデモプロジェクトです。このアプリケーションでは以下の機能を実装しています：

- LocalStackのS3への画像ファイルのアップロード
- アップロードした画像のメタデータをDynamoDBに保存
- S3とDynamoDBから画像とメタデータを取得して一覧表示
- 画像の削除機能（S3とDynamoDBの両方から削除）

## 前提条件

- macOS環境（Intel/Apple Siliconどちらでも可）
- Docker Desktop for Macがインストール済みであること
- Gitがインストール済みであること

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

## 詳細セットアップ手順

### ステップ1: リポジトリのクローン

```bash
git clone https://github.com/Shou-Tucker/nextjs-localstack-s3-dynamodb.git
cd nextjs-localstack-s3-dynamodb
```

### ステップ2: 初期化スクリプトに実行権限を付与

初期化スクリプトを実行可能にします：

```bash
mkdir -p init-scripts
chmod +x init-scripts/01-init-aws.sh
```

### ステップ3: volumeディレクトリの作成

LocalStackのデータ永続化のためのディレクトリを作成します：

```bash
mkdir -p volume
```

### ステップ4: 初期化スクリプトの内容を確認

init-scripts/01-init-aws.sh の内容が正しいことを確認します：

```bash
cat > init-scripts/01-init-aws.sh << 'EOF'
#!/bin/bash

echo "Waiting for LocalStack to be ready..."
sleep 10

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
EOF

chmod +x init-scripts/01-init-aws.sh
```

### ステップ5: Docker Composeファイルの確認

docker-compose.yml ファイルの内容が正しいか確認します：

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  localstack:
    container_name: localstack
    image: localstack/localstack:2.3.2
    ports:
      - "4566:4566"            # LocalStack Gateway
      - "4510-4559:4510-4559"  # external services port range
    environment:
      - DEBUG=1
      - DOCKER_HOST=unix:///var/run/docker.sock
      - SERVICES=s3,dynamodb
      - PERSISTENCE=1
      - DEFAULT_REGION=ap-northeast-1
      - AWS_DEFAULT_REGION=ap-northeast-1
      - INIT_SCRIPTS_PATH=/etc/localstack/init/ready.d
    volumes:
      - "./init-scripts:/etc/localstack/init/ready.d"
      - "./volume:/var/lib/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4566/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  nextjs:
    container_name: nextjs
    build:
      context: ./next-app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./next-app:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - localstack
    environment:
      - AWS_ENDPOINT=http://localstack:4566
      - AWS_REGION=ap-northeast-1
      - AWS_ACCESS_KEY_ID=test
      - AWS_SECRET_ACCESS_KEY=test
      - BUCKET_NAME=images-bucket
      - TABLE_NAME=images-table
EOF
```

### ステップ6: 環境を起動

まずDockerイメージをビルドしてから起動します：

```bash
# 古いコンテナを停止・削除
docker-compose down

# キャッシュなしで再ビルド
docker-compose build --no-cache

# コンテナを起動
docker-compose up -d

# ログを確認（問題の原因を特定するのに役立ちます）
docker-compose logs -f
```

### ステップ7: LocalStackの初期化を確認

LocalStackが正しく初期化されているか確認します：

```bash
# S3バケットの一覧を確認
docker exec -it localstack awslocal s3 ls

# DynamoDBテーブルの一覧を確認
docker exec -it localstack awslocal dynamodb list-tables
```

もしバケットやテーブルが存在しない場合は、手動で作成します：

```bash
# S3バケットを手動で作成
docker exec -it localstack awslocal s3 mb s3://images-bucket

# CORSを設定
docker exec -it localstack awslocal s3api put-bucket-cors --bucket images-bucket --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"]
    }
  ]
}'

# DynamoDBテーブルを手動で作成
docker exec -it localstack awslocal dynamodb create-table \
  --table-name images-table \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### ステップ8: アプリケーションにアクセス

ブラウザで http://localhost:3000 にアクセスし、アプリケーションが正常に動作するか確認します。

## トラブルシューティング

### よくある問題

1. **「NoSuchBucket: The specified bucket does not exist」エラー**
   - 初期化スクリプトが正しく実行されていない可能性があります
   - 手動でバケットを作成してみてください（ステップ7参照）

2. **画像が表示されない**
   - LocalStackのURLがlocalhostに正しく変換されているか確認してください
   - CORS設定が正しいか確認してください

3. **アプリケーションが起動しない**
   - Docker Composeのログを確認して問題を特定してください
   - Next.jsの依存関係が正しくインストールされているか確認してください

### デバッグ方法

```bash
# 両方のコンテナのログを確認
docker-compose logs -f

# LocalStackのログだけを確認
docker-compose logs -f localstack

# Next.jsのログだけを確認
docker-compose logs -f nextjs
```

### LocalStackの内部チェック

```bash
# コンテナに入る
docker exec -it localstack bash

# S3バケットが存在するか確認
awslocal s3 ls

# バケットの内容を確認
awslocal s3 ls s3://images-bucket

# DynamoDBテーブルが存在するか確認
awslocal dynamodb list-tables

# テーブルの内容を確認
awslocal dynamodb scan --table-name images-table
```

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
