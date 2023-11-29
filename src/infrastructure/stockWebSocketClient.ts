import { EventEmitter } from "events";
import WebSocket from "ws";

class StockWebSocketClient extends EventEmitter {
  public PRICE_CHANGE = "price";

  private static instance: StockWebSocketClient;
  private server: any;

  private constructor() {
    super();

    const ws = new WebSocket(
      "wss://ws.twelvedata.com/v1/quotes/price?apikey=1ff192f9bc354f349eeb9cffe7fe8fb1"
    );

    this.server = ws;
    this.init();
  }

  private init() {
    this.addServerListeners();
  }

  async addServerListeners() {
    const WS_MESSAGE = "message";
    await this.server.on("open", async () => {});
    await this.server.on(WS_MESSAGE, async (data: any) => {
      this.emit(this.PRICE_CHANGE, data);
    });
  }

  async send(message: any) {
    await this.server.send(JSON.stringify(message));
  }

  static getInstance(): StockWebSocketClient {
    if (this.instance !== null || this.instance !== undefined) {
      this.instance = new StockWebSocketClient();
    }
    return this.instance;
  }
}
export default StockWebSocketClient;
