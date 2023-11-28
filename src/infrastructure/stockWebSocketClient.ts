class StockWebSocketClient {
  private static instance: StockWebSocketClient;
  private server: any;

  private constructor() {
    const ws = new WebSocket(
      "wss://ws.twelvedata.com/v1/quotes/price?apikey=1ff192f9bc354f349eeb9cffe7fe8fb1"
    );
    this.server = ws;
    this.init();
  }
  private init() {
    this.server.on("open", () => {
      console.log("Stock WebSocket connected");
    });
  }

  async send(message: any) {
    this.server.send(JSON.stringify(message));
  }

  async messageListener(fn: (...args: any) => void) {
    this.server.on("message", fn);
  }

  static getInstance(): StockWebSocketClient {
    if (this.instance !== null || this.instance !== undefined) {
      this.instance = new StockWebSocketClient();
    }
    return this.instance;
  }
}
export default StockWebSocketClient;
