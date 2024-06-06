export class Log {
  static info(message?: any, ...optionalParams: any[]): void {
    console.log(Date.now(), message, ...optionalParams)
  }
}
