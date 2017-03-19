# Botkit with MongoDBの開発雛形（Docker利用）

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE.md)

[English version](README.md) available

みなさん、Slackボットの開発してますか？

Slack導入企業の増加が著しいのでどんどんボットを作りたいのですが、  
いざ開発！と思っても着手するまでに色々と面倒だったりします。

なので思い切って雛形を作りました。

この雛形には以下の基礎的な技術要素を取り入れています。
* Botkit - Slack公式ライブラリ。一番相性いいはず。
* MongoDB - チャットボットと相性抜群！（のはず）ドキュメント指向DB。
* Docker w/ Compose - コラボレータが増えても大丈夫！！すぐにジョインできるよ！
* Slash commands - これぞSlackボットの醍醐味！
* Action buttons - マウス愛好家にも優しい。Slackはエンジニアだけのものではありません。

初めてSlackボットを開発する方でも要領がつかめるように、簡単なランチボット機能を搭載しました。  
`lunch?`とボットに話しかけるとランチの選択肢を提案してくれて、どれかを選ぶとつべこべ返答してくる、というあまり友達にしたくないタイプのボットです。  
でも開発の要領を掴むには十分なはずです。  
`favorites?`と尋ねると、チームメイトの好みの食事を教えてくれる、という他人の秘密を平気でバラすような、やはり友達にしたくないタイプのボットです。  
でもやはり開発の要領を掴むには十分なはず。

## 開発関連情報
### Dockerを使ったローカル開発環境の構築
#### 1. Slack appの登録
[Slack apps](https://api.slack.com/apps)ページで新規のappを登録する。

OAuth設定のRedirect URLに`http://localhost:${PORT}/oauth`をセット。

#### 2. .envファイルの設定
`PORT`を適当に決める。  
`CLIENT_ID`、`CLIENT_SECRET`、`VERIFICATION_TOKEN`をBasic Informationページで取得。

#### 3. Dockerをビルド
```
$ docker-compose build
```

#### 4. アプリを起動
```
$ docker-compose up
```

### Herokuにアプリを構築
#### 1. Slack appの登録
[Slack apps](https://api.slack.com/apps)ページで新規のappを登録する。

OAuth設定のRedirect URLに`https://${APP_NAME}.herokuapp.com/oauth`をセット。

Interactive Messages設定のRequest URLに`https://${APP_NAME}.herokuapp.com/slack/receive`をセット。

Slash CommandsをRequest URLを上と同じものにして設定。

#### 2. gitの設定
gitを初期化して最初のコミットを実行。
```
$ git init
$ git add .
$ git commit -m "initial commit"
```

#### 3. Herokuにデプロイしてアプリを実行
[ダッシュボード](https://dashboard.heroku.com)でMongoDBアドオンと環境変数を設定。もしくは以下のコマンドを実行。

```
$ heroku login
$ heroku create ${APP_NAME}
$ heroku addons:create mongolab:sandbox
$ heroku config:set CLIENT_ID=${YOUR_CLIENT_ID}
$ heroku config:set CLIENT_SECRET=${YOUR_CLIENT_SECRET}
$ heroku config:set VERIFICATION_TOKEN={$YOUR_VERIFICATION_TOKEN}
$ git push heroku master
```

#### 4. 自分のチームにアプリを追加
`https://${APP_NAME}.herokuapp.com/login`にアクセスして自分のチームに追加。

### 開発におけるTips
#### 独自のデータベース名を利用する
[src/index.js](src/index.js)の最初の方にあるMongoUrlという変数に`mongodb://db:27017/${DB_NAME}`という形式でセットする。

#### 独自のcollectionを利用する
[src/index.js](src/index.js)の最初の方にあるstorageを定義する時のcollectionsという配列にcollectionの名称を追加する。

#### MongoDBにホストからアクセスする
27017ポートはコンテナからフォワーディングしているため、ホストのMongoDBにアクセスする時と同じ要領で行う。  
**ホストでMongoDBを起動している場合は事前に停止してください。**
```
$ mongo
```

#### `npm install`の実行
コンテナにログインしてから実行する。
```
$ docker-compose run --rm app /bin/bash
app@XXXXXXXXX: ~/bot$ npm install
app@XXXXXXXXX: ~/bot$ exit
```

## License
[MITライセンス](LICENSE.md)を遵守した使用をお願いします。
