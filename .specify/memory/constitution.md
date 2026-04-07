# Circle Port Product Constitution
## 🏁 プロジェクト目的
日本の同人クリエイターが、海外ファンに自分の作品やグッズを安心して販売できる**越境ECプラットフォーム**を構築する。
## 🧭 開発理念（Principles）
1. **透明性** – 仕様・設計・実装は `.specify/` 内で一元管理し、履歴をGitHubで追跡可能にする。  
2. **型安全性** – 全実装はTypeScript＋Prismaで型保証。  
3. **多言語対応** – UIは日本語／英語をサポート。  
4. **二段階決済モデル** – Fanの購入は一次／二次決済の2段構成で安全性を確保。  
5. **分離された権限モデル** – Creator / Fan / Admin の3層アーキテクチャを維持し、責務を明確化。  
6. **安全な金流処理** – Stripe Connectを採用して振込を自動化。  
7. **透明な配送フロー** – 国内検品→国際発送を明示的に管理する仕組みを持つ。  
## ⚙️ 技術スタック
| レイヤー | 技術 |
|-----------|------|
| Frontend | Next.js (TypeScript), TailwindCSS, next-intl |
| Backend | NestJS (TypeScript), Prisma, PostgreSQL |
| Infra | AWS（S3/RDS/Lambda）、Vercel（FE Hosting） |
| Payment | Stripe Connect |
| Auth | NextAuth (OAuth / JWT) |
## 📋 開発プロセス（Spec Driven）
1. `/specify` で機能仕様（spec.md）を定義する  
2. `/clarify` でAIが曖昧な仕様を質問  
3. `/plan` で開発計画書を自動生成  
4. `/tasks` でGitHub Issueに展開  
5. Pull Request時に `.specify/specs` と整合性レビューを行う  
## 🧱 コードスタイル基準
- ESLint + Prettier + TypeScript strict mode を採用  
- ディレクトリ構成は `apps/`（Next.js）と `api/`（NestJS）のモノレポ形式  
- ファイル命名は kebab-case、変数は camelCase  
- 翻訳キーは `t("namespace.key")` 形式で統一  
## 🔐 セキュリティ原則
- すべてのAPIは JWT＋RoleGuardで保護  
- 個人情報は暗号化して保存（PII保護）  
- Stripe Webhookは検証署名を必須化  
## 🚀 成功条件（Definition of Done）
- Fanが一次／二次決済フローを完走できる  
- Creatorが売上および国内配送情報を登録可能  
- Adminが検品・国際発送・振込まで管理できる  
- Lighthouseスコア 85点以上  
- GitHub Actionsによる自動テスト成功率 90%以上  
