export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'

export interface OHLC {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ApiEvents {
  'ohlc/1m': [OHLC]
}
