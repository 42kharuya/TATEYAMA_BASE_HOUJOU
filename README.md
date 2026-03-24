# TATEYAMA_BASE_HOUJOU

🌴 館山市にある貸別荘「TATEYAMA BASE 北条」のWebサイト

## ローカル開発（最小）

前提：Node.js が入っていること

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

### よく使うコマンド

```bash
npm run lint
npm run format
npm run build
```

## 環境変数

- `.env` はコミットしません（`.env.example` のみコミットします）
- ローカルで値を入れる場合は、`.env.example` を参考に `.env.local` を作って設定してください
