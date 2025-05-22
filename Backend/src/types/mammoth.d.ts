declare module 'mammoth' {
  interface MammothOptions {
    path?: string;
    buffer?: Buffer;
    arrayBuffer?: ArrayBuffer;
  }

  interface MammothResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  function extractRawText(options: MammothOptions): Promise<MammothResult>;
  
  export = {
    extractRawText
  };
}
