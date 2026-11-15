import { action, observable, runInAction } from 'mobx';
import { BaseModel } from 'mobx-restful';
import { callCompletionApi, type CompletionRequestOptions, type UseCompletionOptions } from 'ai';

export class CompletionModel<BODY extends object = object> extends BaseModel {
  @observable accessor completion = '';
  @observable accessor error: Error | undefined = undefined;
  @observable accessor input = '';

  private abortController: AbortController | null = null;
  private requestId = 0;
  private readonly options: UseCompletionOptions<BODY>;

  constructor(options: UseCompletionOptions<BODY> = {}) {
    super();
    this.options = options;
    runInAction(() => {
      this.completion = options.initialCompletion ?? '';
      this.input = options.initialInput ?? '';
    });
  }

  async complete(prompt: string, requestOptions?: CompletionRequestOptions<BODY>) {
    const requestId = ++this.requestId;
    const { api = '/api/completion', ...options } = this.options;

    return callCompletionApi({
      api,
      prompt,
      credentials: options.credentials,
      headers: this.mergeHeaders(options.headers, requestOptions?.headers),
      body: { ...options.body, ...requestOptions?.body },
      streamProtocol: options.streamProtocol,
      fetch: options.fetch,
      setCompletion: completion => {
        if (requestId === this.requestId) this.setCompletion(completion);
      },
      setLoading: loading => {
        if (requestId === this.requestId)
          runInAction(() => {
            this.downloading = Number(loading);
          });
      },
      setError: error => {
        if (requestId === this.requestId)
          runInAction(() => {
            this.error = error;
          });
      },
      setAbortController: controller => {
        if (requestId === this.requestId) this.abortController = controller;
      },
      getAbortController: () => this.abortController,
      onFinish: options.onFinish,
      onError: options.onError,
    });
  }

  @action
  setCompletion = (completion: string) => {
    this.completion = completion;
  };

  @action
  setInput = (input: string) => {
    this.input = input;
  };

  handleInputChange = (event: { target: { value: string } }) => {
    this.setInput(event.target.value);
  };

  async handleSubmit(event?: { preventDefault?: () => void }) {
    event?.preventDefault?.();
    if (!this.input) return;

    const input = this.input;
    this.setInput('');
    return this.complete(input);
  }

  stop = () => {
    this.abortController?.abort();
  };

  @action
  override clear() {
    this.stop();
    this.requestId++;
    this.abortController = null;
    this.completion = '';
    this.error = undefined;
    super.clear();
  }

  get isLoading() {
    return this.downloading > 0;
  }

  private mergeHeaders(...sources: Array<Record<string, string> | Headers | undefined>) {
    const headers = new Headers();

    for (const source of sources) {
      if (source instanceof Headers) {
        source.forEach((value, key) => headers.set(key, value));
      } else {
        for (const [key, value] of Object.entries(source ?? {})) headers.set(key, value);
      }
    }

    return headers;
  }
}
