/**
 * Ambient declarations for packages that the app imports but does not install.
 * These describe the subset of each API that this codebase actually calls.
 */

declare module 'react-helmet-async' {
  import { ReactNode } from 'react'
  export function HelmetProvider(props: { children?: ReactNode; context?: object }): JSX.Element
  export function Helmet(props: { children?: ReactNode }): JSX.Element
}

declare module 'react-router-dom' {
  import { ReactNode } from 'react'
  export function BrowserRouter(props: { children?: ReactNode }): JSX.Element
  export function Link(props: { to: string; children?: ReactNode; className?: string }): JSX.Element
  export function useNavigate(): (to: string | number) => void
  export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T
  export function useLocation(): { pathname: string; search: string; hash: string; state: unknown }
}

declare module 'i18next-browser-languagedetector' {
  const LanguageDetector: {
    type: 'languageDetector'
    init(services: unknown, detectorOptions: unknown, i18nextOptions: unknown): void
    detect(detectionOrder?: string[]): string | undefined
    cacheUserLanguage(lng: string): void
  }
  export default LanguageDetector
}

declare module 'echarts' {
  export interface ECharts {
    setOption(option: object, notMerge?: boolean, lazyUpdate?: boolean): void
    resize(opts?: object): void
    dispose(): void
    on(event: string, handler: (...args: unknown[]) => void): void
    off(event: string, handler?: (...args: unknown[]) => void): void
  }
  export function init(dom: HTMLElement | null, theme?: string | object, opts?: object): ECharts
  export namespace graphic {
    class LinearGradient {
      constructor(
        x: number,
        y: number,
        x2: number,
        y2: number,
        colorStops?: Array<{ offset: number; color: string }>
      )
    }
  }
}

declare module 'hotkeys-js' {
  export interface HotkeysEvent {
    key: string
    method: string
    mods: number[]
    keys?: string[]
    shortcut?: string
    scope?: string
  }
  type HotkeyHandler = (event: KeyboardEvent, handler: HotkeysEvent) => void
  interface Hotkeys {
    (key: string, scope: string | undefined, method: HotkeyHandler): void
    (key: string, method: HotkeyHandler): void
    filter: (event: KeyboardEvent) => boolean
    getPressedKeyString(): string[]
    unbind(key?: string, scope?: string): void
  }
  const hotkeys: Hotkeys
  export default hotkeys
}

declare module 'better-sqlite3' {
  namespace BetterSqlite3 {
    interface Statement {
      run(...params: any[]): { changes: number; lastInsertRowid: number | bigint }
      get(...params: any[]): any
      all(...params: any[]): any[]
    }
    interface Database {
      prepare(sql: string): Statement
      exec(sql: string): this
      pragma(source: string, options?: object): any
      close(): void
    }
    interface Options {
      readonly?: boolean
      fileMustExist?: boolean
      timeout?: number
      verbose?: (message?: unknown) => void
    }
  }

  interface BetterSqlite3Constructor {
    new (filename: string, options?: BetterSqlite3.Options): BetterSqlite3.Database
    (filename: string, options?: BetterSqlite3.Options): BetterSqlite3.Database
  }

  const BetterSqlite3: BetterSqlite3Constructor & typeof BetterSqlite3
  export = BetterSqlite3
}

declare module '@stripe/stripe-js' {
  export interface StripeError {
    message?: string
    type?: string
    code?: string
  }
  export interface Stripe {
    redirectToCheckout(options: { sessionId: string }): Promise<{ error?: StripeError }>
    confirmCardPayment(
      clientSecret: string,
      data?: { payment_method?: string }
    ): Promise<{ error?: StripeError; paymentIntent?: { status?: string } }>
    elements(options?: StripeElementsOptions): unknown
  }
  export interface StripeElementsOptions {
    clientSecret?: string
    appearance?: object
    locale?: string
  }
  export function loadStripe(publishableKey: string, options?: object): Promise<Stripe | null>
}

declare module 'electron-updater' {
  export interface UpdateInfo {
    version: string
    files?: unknown[]
    path?: string
    releaseDate?: string
    releaseNotes?: string | Array<{ version: string; note: string }>
  }
  export interface ProgressInfo {
    total: number
    delta: number
    transferred: number
    percent: number
    bytesPerSecond: number
  }
  export interface AutoUpdater {
    autoDownload: boolean
    autoInstallOnAppQuit: boolean
    allowPrerelease: boolean
    logger: unknown
    on(event: 'checking-for-update', listener: () => void): this
    on(event: 'update-available', listener: (info: UpdateInfo) => void): this
    on(event: 'update-not-available', listener: (info: UpdateInfo) => void): this
    on(event: 'error', listener: (error: Error) => void): this
    on(event: 'download-progress', listener: (progress: ProgressInfo) => void): this
    on(event: 'update-downloaded', listener: (info: UpdateInfo) => void): this
    checkForUpdates(): Promise<{ updateInfo: UpdateInfo } | null>
    downloadUpdate(): Promise<string[]>
    quitAndInstall(isSilent?: boolean, isForceRunAfter?: boolean): void
  }
  export const autoUpdater: AutoUpdater
}

declare module 'electron-log' {
  interface LogFunctions {
    error(...params: unknown[]): void
    warn(...params: unknown[]): void
    info(...params: unknown[]): void
    verbose(...params: unknown[]): void
    debug(...params: unknown[]): void
    silly(...params: unknown[]): void
    log(...params: unknown[]): void
  }
  interface ElectronLog extends LogFunctions {
    transports: {
      file: { level: string | false }
      console: { level: string | false }
    }
  }
  const log: ElectronLog
  export default log
}

declare namespace Intl {
  interface DateTimeFormatOptions {
    fractionalSecondDigits?: 1 | 2 | 3
  }
}
