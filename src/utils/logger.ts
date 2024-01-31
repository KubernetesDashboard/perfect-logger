import { LogLevel } from "../types/log-level";

export class Logger {
  static templates = {
    NESTJS: `[%appName] %pid - %date(MM/DD/YYYY, hh:mm:ss A) [%name] %message`,
    SPRING_BOOT: `%date(YYYY-MM-DD hh:mm:ss.ms)  %spaces(%level, 5) %pid --- [%spaces(%name, 15, true)] %spaces(%module, 15)  : %message`,
    DEFAULT: `[%name] [%datetime] %message`
  };

  constructor(
    private readonly _name: string = process.env.NAME || "Logger",
    private readonly _template: string = Logger.templates.DEFAULT,
    private readonly _appName: string = process.env.APP_NAME || "PerfectLogger"
  ) {}

  debug<TMessage extends any[]>(...messages: TMessage) {
    this.print(this.message(messages, LogLevel.DEBUG));
  }

  info<TMessage extends any[]>(...messages: TMessage) {
    this.print(this.message(messages, LogLevel.INFO));
  }

  log<TMessage extends any[]>(...messages: TMessage) {
    this.print(this.message(messages, LogLevel.LOG));
  }

  warn<TMessage extends any[]>(...messages: TMessage) {
    this.print(this.message(messages, LogLevel.WARN));
  }

  error<TMessage extends any[]>(...messages: TMessage) {
    this.print(this.message(messages, LogLevel.ERROR));
  }

  private print(message: string) {
    console.log(message);
  }

  private message<TMessage extends any[]>(messages: TMessage, level: LogLevel) {
    const messageItems = messages.flatMap(message => this.stringifyMessage(message)).join(" ");
    return messageItems
      .split("\n")
      .map(message => this.formatMessage(message, level))
      .join("\n");
  }

  private formatMessage(message: string, level: LogLevel) {
    return this._template
      .replace("%name", this._name)
      .replace("%datetime", new Date().toISOString())
      .replace("%pid", process.pid.toString())
      .replace("%appName", this._appName)
      .replace("%message", message)
      .replace(/%date\((.+?)\)/g, (_, format) => this.formatDate(format))
      .replace(/%level/g, level)
      .replace(/%module/g, "<WIP>")
      .replace(/%spaces\((.+?)\)/g, (_, args) => this.space(args));
  }

  private space(args: string) {
    const [rawString, rawLength, rawBefore = "false"] = args.split(",");
    const [string, length, before] = [rawString.trim(), +rawLength.trim(), rawBefore.trim()];
    const formattedString = before === "true" ? string.slice(0, length) : string.slice(-length);
    return before === "true"
      ? formattedString.padStart(length, " ")
      : formattedString.padEnd(length, " ");
  }

  private formatDate(format: string) {
    return format
      .replace("MM", (new Date().getMonth() + 1).toString().padEnd(2, "0"))
      .replace("DD", new Date().getDate().toString().padEnd(2, "0"))
      .replace("YYYY", new Date().getFullYear().toString())
      .replace("hh", new Date().getHours().toString().padEnd(2, "0"))
      .replace("h", (new Date().getHours() % 12).toString().padEnd(2, "0"))
      .replace("mm", new Date().getMinutes().toString().padEnd(2, "0"))
      .replace("ss", new Date().getSeconds().toString().padEnd(2, "0"))
      .replace("ms", new Date().getMilliseconds().toString().padEnd(3, "0"))
      .replace("A", new Date().getHours() < 12 ? "AM" : "PM");
  }

  private stringifyMessage = <TMessage>(message: TMessage) => {
    switch (true) {
      case message === null:
        return "null";
      case message === undefined:
        return "undefined";
      case message instanceof Error:
        return `${message.name}: ${message.message}\n${message.stack}`;
      case typeof message === "function":
        return `function ${message.name}() { ... }`;
      case typeof message === "object":
        return JSON.stringify(message, null, 2);
      default:
        return message.toString();
    }
  };
}
