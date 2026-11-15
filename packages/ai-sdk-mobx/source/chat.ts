import { action, observable, runInAction } from 'mobx';
import { BaseModel } from 'mobx-restful';
import { AbstractChat, type ChatInit, type ChatState, type ChatStatus, type UIMessage } from 'ai';

class MobXChat<UI_MESSAGE extends UIMessage> extends AbstractChat<UI_MESSAGE> {}

export class ChatModel<UI_MESSAGE extends UIMessage = UIMessage> extends BaseModel {
  @observable accessor status: ChatStatus = 'ready';
  @observable accessor error: Error | undefined = undefined;
  @observable accessor messages: UI_MESSAGE[] = [];
  @observable accessor experimental_queuedMessages: UI_MESSAGE[] = [];

  readonly chat: MobXChat<UI_MESSAGE>;

  constructor({ messages = [], ...options }: ChatInit<UI_MESSAGE> = {}) {
    super();
    runInAction(() => {
      this.messages = messages;
    });
    const model = this;
    const state: ChatState<UI_MESSAGE> = {
      get status() {
        return model.status;
      },
      set status(value) {
        runInAction(() => {
          model.status = value;
        });
      },
      get error() {
        return model.error;
      },
      set error(value) {
        runInAction(() => {
          model.error = value;
        });
      },
      get messages() {
        return model.messages;
      },
      set messages(value) {
        runInAction(() => {
          model.messages = value;
        });
      },
      get experimental_queuedMessages() {
        return model.experimental_queuedMessages;
      },
      set experimental_queuedMessages(value) {
        runInAction(() => {
          model.experimental_queuedMessages = value;
        });
      },
      pushMessage: this.pushMessage,
      popMessage: this.popMessage,
      replaceMessage: this.replaceMessage,
      snapshot: this.snapshot,
    };
    this.chat = new MobXChat({ ...options, state });
  }

  @action
  pushMessage = (message: UI_MESSAGE) => {
    this.messages = [...this.messages, message];
  };

  @action
  popMessage = () => {
    this.messages = this.messages.slice(0, -1);
  };

  @action
  replaceMessage = (index: number, message: UI_MESSAGE) => {
    this.messages = this.messages.map((current, position) =>
      position === index ? this.snapshot(message) : current,
    );
  };

  snapshot = <T>(value: T): T => {
    if (
      value == null ||
      typeof value !== 'object' ||
      !('parts' in value) ||
      !Array.isArray(value.parts)
    )
      return value;

    return {
      ...value,
      parts: value.parts.map(part =>
        part != null && typeof part === 'object' ? { ...part } : part,
      ),
      ...('metadata' in value && value.metadata != null && typeof value.metadata === 'object'
        ? { metadata: Array.isArray(value.metadata) ? [...value.metadata] : { ...value.metadata } }
        : {}),
    } as T;
  };

  get id() {
    return this.chat.id;
  }

  sendMessage: MobXChat<UI_MESSAGE>['sendMessage'] = (...args) => this.chat.sendMessage(...args);
  regenerate: MobXChat<UI_MESSAGE>['regenerate'] = (...args) => this.chat.regenerate(...args);
  stop = () => this.chat.stop();
  resumeStream = (...args: Parameters<MobXChat<UI_MESSAGE>['resumeStream']>) =>
    this.chat.resumeStream(...args);
  addToolOutput: MobXChat<UI_MESSAGE>['addToolOutput'] = (...args) =>
    this.chat.addToolOutput(...args);
  addToolApprovalResponse: MobXChat<UI_MESSAGE>['addToolApprovalResponse'] = (...args) =>
    this.chat.addToolApprovalResponse(...args);
  clearError = () => this.chat.clearError();
  dispose = () => this.chat.dispose();

  @action
  override clear() {
    void this.chat.stop();
    this.messages = [];
    this.experimental_queuedMessages = [];
    this.status = 'ready';
    this.error = undefined;
    super.clear();
  }
}
