import { ErrorBase } from "./base.js";

export class Unreachable extends ErrorBase {
  public readonly name = "Unreachable";

  constructor() {
    super(`Unreachable`);
  }
}

export class UnexpectedStatusCode extends ErrorBase {
  public readonly name = "UnexpectedStatusCode";

  constructor(public readonly status: number) {
    super(`UnexpectedStatusCode ${status}`);
  }
}
