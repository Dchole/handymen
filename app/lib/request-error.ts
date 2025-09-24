export class RequestError extends Error {
  private _info: Record<string, unknown>;
  private _status: number;

  constructor(
    message: string,
    status: number = 500,
    info: Record<string, unknown>
  ) {
    super();
    this.message = message;
    this._info = info;
    this._status = status;
  }

  get info() {
    return this._info;
  }

  set info(errorInfo: typeof this._info) {
    this._info = errorInfo;
  }

  get status() {
    return this._status;
  }

  set status(errorStatus: typeof this._status) {
    this._status = errorStatus;
  }
}
