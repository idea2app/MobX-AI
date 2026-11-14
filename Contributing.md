# 贡献指南

## 环境要求

- Node.js 22.13 或更高版本
- PNPM 11 或更高版本

使用仓库根目录安装依赖并运行各包测试：

```sh
pnpm install
pnpm test
```

根目录通过 Node.js 原生 test runner 运行各包 `test/` 中的 TypeScript 测试，并使用 `@swc-node/register` 读取根目录 `.swcrc`。配置启用了 ECMAScript Stage 3 装饰器与 TSX 转换。

```sh
pnpm --filter ai-sdk-mobx test
pnpm --filter ai-ui-react test
```

`ai-sdk-mobx` 的测试用于 SDK 模型和纯 JavaScript 逻辑；`ai-ui-react` 使用 React Testing Library 与 jsdom 验证 TSX 渲染。

## 工作区

- `packages/ai-sdk-mobx`：MobX AI SDK 模型
- `packages/ai-ui-react`：React AI 界面组件

两个包均为公开发布包。UI 包通过 PNPM workspace 依赖 SDK 包；新增包间依赖时应保持 `ai-ui-react → ai-sdk-mobx` 的依赖方向。
