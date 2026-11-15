# AI SDK for MobX

MobX models for [AI SDK][2] interactions, built on [mobx-restful][1].

Each stateful React hook in `@ai-sdk/react` has a corresponding MobX model:

| AI SDK hook                | MobX model        |
| -------------------------- | ----------------- |
| `useChat`                  | `ChatModel`       |
| `useCompletion`            | `CompletionModel` |
| `useObject`                | `ObjectModel`     |
| `experimental_useRealtime` | `RealtimeModel`   |

```ts
import { ChatModel, CompletionModel } from 'ai-sdk-mobx';

const chat = new ChatModel();
await chat.sendMessage({ text: 'Hello!' });

const completion = new CompletionModel();
await completion.complete('Write a greeting');
```

The models expose their state as MobX observables. `ChatModel.chat` provides the
underlying AI SDK chat instance for the full chat API.

## Install

```sh
npm install ai-sdk-mobx
```

[1]: https://github.com/idea2app/MobX-RESTful
[2]: https://github.com/vercel/ai/tree/main/packages/react
