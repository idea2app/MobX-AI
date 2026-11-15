import { action, observable, runInAction } from 'mobx';
import { BaseModel } from 'mobx-restful';
import {
  Experimental_AbstractRealtimeSession as AbstractRealtimeSession,
  type Experimental_RealtimeServerEvent as RealtimeServerEvent,
  type Experimental_RealtimeSessionOptions as RealtimeSessionOptions,
  type Experimental_RealtimeState as RealtimeState,
  type Experimental_RealtimeStatus as RealtimeStatus,
  type UIMessage,
} from 'ai';

class RealtimeSession extends AbstractRealtimeSession {
  protected state: RealtimeState = {
    status: 'disconnected',
    messages: [],
    events: [],
    isCapturing: false,
    isPlaying: false,
  };

  constructor(
    options: RealtimeSessionOptions,
    private readonly publish: <KEY extends keyof RealtimeState>(
      key: KEY,
      value: RealtimeState[KEY],
    ) => void,
  ) {
    super(options);
  }

  protected setState<KEY extends keyof RealtimeState>(key: KEY, value: RealtimeState[KEY]) {
    this.state = { ...this.state, [key]: value };
    this.publish(key, value);
  }
}

export class RealtimeModel extends BaseModel {
  @observable accessor status: RealtimeStatus = 'disconnected';
  @observable accessor messages: UIMessage[] = [];
  @observable accessor events: RealtimeServerEvent[] = [];
  @observable accessor isCapturing = false;
  @observable accessor isPlaying = false;
  @observable accessor session: RealtimeState['session'];

  private readonly realtime: RealtimeSession;

  constructor(options: RealtimeSessionOptions) {
    super();
    this.realtime = new RealtimeSession(options, (key, value) => {
      runInAction(() => {
        this[key] = value as never;
      });
    });
  }

  connect = (...args: Parameters<RealtimeSession['connect']>) => this.realtime.connect(...args);
  close = (...args: Parameters<RealtimeSession['close']>) => this.realtime.close(...args);
  resumePlayback = () => this.realtime.resumePlayback();
  resumeAudioCapture = () => this.realtime.resumeAudioCapture();
  disconnect = () => this.realtime.disconnect();
  addToolOutput = (...args: Parameters<RealtimeSession['addToolOutput']>) =>
    this.realtime.addToolOutput(...args);
  sendEvent = (...args: Parameters<RealtimeSession['sendEvent']>) =>
    this.realtime.sendEvent(...args);
  sendTextMessage = (...args: Parameters<RealtimeSession['sendTextMessage']>) =>
    this.realtime.sendTextMessage(...args);
  sendAudio = (...args: Parameters<RealtimeSession['sendAudio']>) =>
    this.realtime.sendAudio(...args);
  commitAudio = () => this.realtime.commitAudio();
  clearAudioBuffer = () => this.realtime.clearAudioBuffer();
  requestResponse = (...args: Parameters<RealtimeSession['requestResponse']>) =>
    this.realtime.requestResponse(...args);
  cancelResponse = () => this.realtime.cancelResponse();
  startAudioCapture = (...args: Parameters<RealtimeSession['startAudioCapture']>) =>
    this.realtime.startAudioCapture(...args);
  stopAudioCapture = () => this.realtime.stopAudioCapture();
  stopPlayback = () => this.realtime.stopPlayback();

  @action
  dispose = () => {
    this.realtime.dispose();
  };
}
