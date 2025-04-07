# Implement candle aggregation and stream them

Please refer to the [README](../README.md) for instructions on how to run the project and what we expect from you.

## Description

Aggregate realtime market data and stream it to the front.

A visual representation of price movements over time that is often used in finance is a candle chart, composed of OHLC (Open-High-Low-Close) candles. Each candle gives information about the asset price for a given time period: the price at the start of the period (open price, `open`), the highest price reached during the period (`high`), the lowest price reached during the period (`low`), the price at the end of the period (close price, `close`) and the volume of trading activity during the period (`volume`).

You will be provided with a function to get the current incomplete candle for every timeframe and an event stream of 1-minute OHLC candles, that is fired several times per second. Your task will be to process these 1-minute candles, aggregate them into multiple larger timeframes and allow the front to subscribe to these aggregated timeframes.

### Initial candle

You are provided with the function `getInitialCandle` that fetches the current incomplete candle for a given timeframe. The returned candle has the `time` property set to the beginning of the period, and data is the last known state of the candle. You can try fetching the initial candle multiple times to see how it changes.

### Stream of 1-minute OHLC candles

The event stream can be fired several times per second. An event is the current incomplete 1-minute candle, updated as new data comes in. Given events with identical `time` properties, the most recent event corresponds to the most recent data for this minute and takes precedence.

### Aggregation

- Base timeframe is `1m`, aggregated timeframes are `5m` and `15m` for this exercise.
- Each timeframe origin is the beginning of the day (00:00:00 UTC).
- Each aggregated timeframe is computed from the base timeframe.
  - The `open` price is the first price in the time period.
  - The `high` price is the highest price in the time period.
  - The `low` price is the lowest price in the time period.
  - The `close` price is the last price in the time period.
  - The `volume` is the sum of the volume of the 1-minute candles that are aggregated.

Units are is USD.

## Technical Implementation

### Backend

- Listen to the event stream of 1-minute OHLC candles. Events are fired several times per second. An event is the current 1-minute candle, updated as new data comes in. If the `time` property is the same, the most recent event takes precedence.
- Build and cache candles for each timeframe.
- Reset the candle when the time period ends (e.g. every hour for the 1h timeframe).
- Single tRPC subscription endpoint with the timeframe as a parameter.

### Frontend

- Basic form to select the timeframe to display.
- Subscribe to the event stream of the selected timeframe.
- Display a table with the OHLC data for the selected timeframe. When first subscribed, the table will contain only the initial candle. Add rows to the table as candles are closed.
- The current candle data of the selected timeframe should be updated live as new updates are received.

## Additional Notes

The priority should be given to the backend aggregation.

Feel free to implement additional features or improvements beyond these requirements, provided you can justify their inclusion.
