declare module 'qr-scanner' {
  interface ScanResult {
    data: string
  }

  interface QrScannerOptions {
    returnDetailedScanResult?: boolean
    preferredCamera?: 'user' | 'environment'
    highlightScanRegion?: boolean
    highlightCodeOutline?: boolean
  }

  class QrScanner {
    constructor(
      videoElement: HTMLVideoElement,
      onDecode: (result: ScanResult) => void,
      options?: QrScannerOptions
    )

    start(): Promise<void>
    stop(): void
    destroy(): void
    setCamera(facingMode: 'user' | 'environment'): Promise<void>
    
    static hasCamera(): boolean
  }

  export = QrScanner
}