# MobX-AI

基于 MobX 的 AI SDK 与 React 组件库。本仓库计划采用 PNPM 建立多包工作区，将 AI 交互状态管理与 AI 界面组件分层维护。

> 当前阶段仅调研并记录仓库设计，不包含可安装的工作区配置、运行时代码或组件实现。

## 目标

- **`ai-sdk-mobx`**：以 [`mobx-restful`](https://github.com/idea2app/MobX-RESTful) 为基础，迁移 Vercel AI SDK [`packages/react`](https://github.com/vercel/ai/tree/main/packages/react) 中的 React hook 业务逻辑，以 MobX Model 提供对应能力。
- **`ai-ui-react`**：基于 `ai-sdk-mobx`、[`idea-react`](https://github.com/idea2app/Idea-React) 和 [`mobx-restful-table`](https://github.com/idea2app/MobX-RESTful-Table)，实现 [`shadcn/ui AI Elements`](https://ui.shadcn.com/docs/ai-elements) 文档中的全部组件与组合模式。

## 目标工作区

计划使用 PNPM workspace 管理以下包：

```text
MobX-AI/
├── packages/
│   ├── ai-sdk-mobx/
│   └── ai-ui-react/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

包间依赖方向为 `ai-ui-react → ai-sdk-mobx`。公共依赖和开发命令由仓库根目录统一管理；各包独立维护入口、版本和发布配置。

## 包设计

### `ai-sdk-mobx`

以 Vercel AI SDK React 包的公开 hooks 和业务行为为迁移基准。开始实现时，应先核对上游当前版本的导出，确保每个 React hook 都有对应的 `BaseModel` 或 `ListModel` 子类，而不是把状态逻辑留在 React hook 中。

当前上游文档中的主要 hooks 包括：

| React hook | MobX Model 职责 |
| --- | --- |
| `useChat` | `ListModel`：管理消息列表、发送与重载、流式响应、停止生成及聊天状态 |
| `useCompletion` | `BaseModel`：管理输入、文本补全、流式结果及请求状态 |
| `useObject` | `BaseModel`：管理结构化对象的流式生成及请求状态 |

上表是已知主要 hooks 的初始映射；上游新增或调整的 hook 也须纳入迁移范围。迁移应保留各 hook 的核心请求、流式处理、错误和生命周期语义，并改由 MobX Model 持有与更新状态。React 侧只消费 Model，不重复实现业务状态。

### `ai-ui-react`

以 AI Elements 文档目录为组件范围的唯一基准，逐项复刻其中所有组件、变体及组合模式，并使用 `ai-sdk-mobx` 提供的模型能力。组件应遵循 `idea-react` 的 React 组件约定，并在适用时复用 `mobx-restful-table` 的数据展示能力。

AI Elements 上游会持续演进，因此实现前及每次覆盖范围验收时都应核对文档目录；不能以旧版组件清单替代当前完整目录，也不能因某个组件未在示例应用中使用而跳过。

## 开发与验收方向

工作区配置完成后，预期使用 PNPM 在仓库根目录安装依赖，并按包执行构建、检查和测试。具体命令应在实现对应配置与脚本时确定；本阶段不提供尚不可运行的命令。

后续实现至少按以下标准验收：

1. PNPM 能识别两个包及其本地依赖关系。
2. `ai-sdk-mobx` 覆盖上游 React 包的全部 hooks，并以对应的 `BaseModel`/`ListModel` 子类管理状态。
3. `ai-ui-react` 覆盖验收时 AI Elements 文档中的全部组件及组合模式。
4. 两个包各自的 API、依赖边界和使用示例均有文档，并有针对模型行为与组件交互的测试。

## 参考资料

- [Vercel AI SDK React package](https://github.com/vercel/ai/tree/main/packages/react)
- [AI SDK UI 文档](https://ai-sdk.dev/docs/ai-sdk-ui)
- [shadcn/ui AI Elements](https://ui.shadcn.com/docs/ai-elements)
- [mobx-restful](https://github.com/idea2app/MobX-RESTful)
- [idea-react](https://github.com/idea2app/Idea-React)
- [mobx-restful-table](https://github.com/idea2app/MobX-RESTful-Table)
