import { action, observable, runInAction } from 'mobx';
import { BaseModel } from 'mobx-restful';
import {
  asSchema,
  parsePartialJson,
  type DeepPartial,
  type FlexibleSchema,
  type InferSchema,
} from 'ai';

export type ObjectModelOptions<SCHEMA extends FlexibleSchema, RESULT> = {
  api: string;
  schema: SCHEMA;
  initialValue?: DeepPartial<RESULT>;
  fetch?: typeof globalThis.fetch;
  credentials?: RequestCredentials;
  headers?:
    | Record<string, string>
    | Headers
    | (() => Record<string, string> | Headers | Promise<Record<string, string> | Headers>);
  onFinish?: (result: {
    object: RESULT | undefined;
    error: Error | undefined;
  }) => void | Promise<void>;
  onError?: (error: Error) => void;
};

export class ObjectModel<
  SCHEMA extends FlexibleSchema,
  RESULT = InferSchema<SCHEMA>,
  INPUT = unknown,
> extends BaseModel {
  @observable accessor object: DeepPartial<RESULT> | undefined;
  @observable accessor error: Error | undefined = undefined;

  private abortController: AbortController | null = null;

  constructor(private readonly options: ObjectModelOptions<SCHEMA, RESULT>) {
    super();
    runInAction(() => {
      this.object = options.initialValue;
    });
  }

  async submit(input: INPUT) {
    const controller = new AbortController();
    this.stop();
    this.abortController = controller;
    runInAction(() => {
      this.error = undefined;
      this.object = undefined;
      this.downloading = 1;
    });

    try {
      const { headers, ...options } = this.options;
      const resolvedHeaders = typeof headers === 'function' ? await headers() : headers;
      const response = await (options.fetch ?? globalThis.fetch)(options.api, {
        method: 'POST',
        headers: this.mergeHeaders(resolvedHeaders),
        credentials: options.credentials,
        signal: controller.signal,
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error((await response.text()) || 'Failed to fetch the response.');
      if (response.body == null) throw new Error('The response body is empty.');

      let accumulatedText = '';
      let latestObject: DeepPartial<RESULT> | undefined;
      await response.body.pipeThrough(new TextDecoderStream()).pipeTo(
        new WritableStream<string>({
          write: async chunk => {
            accumulatedText += chunk;
            const { value } = await parsePartialJson(accumulatedText);
            if (controller === this.abortController) {
              latestObject = value as DeepPartial<RESULT>;
              runInAction(() => {
                this.object = latestObject;
              });
            }
          },
          close: async () => {
            const validation = await asSchema(this.options.schema).validate?.(latestObject);
            await this.options.onFinish?.(
              validation == null
                ? {
                    object: latestObject as RESULT | undefined,
                    error: undefined,
                  }
                : validation.success
                  ? {
                      object: validation.value as RESULT,
                      error: undefined,
                    }
                  : { object: undefined, error: validation.error },
            );
          },
        }),
        { signal: controller.signal },
      );
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        const requestError = error instanceof Error ? error : new Error(String(error));
        runInAction(() => {
          this.error = requestError;
        });
        this.options.onError?.(requestError);
      }
    } finally {
      if (controller === this.abortController) {
        this.abortController = null;
        runInAction(() => {
          this.downloading = Math.max(0, this.downloading - 1);
        });
      }
    }
  }

  @action
  clear = () => {
    this.stop();
    this.object = undefined;
    this.error = undefined;
    super.clear();
  };

  @action
  stop = () => {
    this.abortController?.abort();
    this.abortController = null;
    this.downloading = 0;
  };

  get isLoading() {
    return this.downloading > 0;
  }

  private mergeHeaders(source?: Record<string, string> | Headers) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (source instanceof Headers) source.forEach((value, key) => headers.set(key, value));
    else for (const [key, value] of Object.entries(source ?? {})) headers.set(key, value);
    return headers;
  }
}
