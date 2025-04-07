# Implement Basic Futures Trading Pricer

Please refer to the [README](../README.md) for instructions on how to run the project and what we expect from you.

## Description

Implement a futures pricer that calculates trading parameters for a derivative contracts.

This implementation focuses on calculating the margin requirements and liquidation prices for inverse futures trading.

The pricer takes basic trade parameters (side, quantity, leverage, and entry price) and calculates:

- **Margin**: The amount of collateral required to open and maintain a futures position
- **Liquidation Price**: The price at which a position would be automatically closed if the market moves against it

These calculations help traders understand their risk exposure and capital requirements before entering a position.

You can use the LN Markets pricer to compare your results.

Implement robust validation for the following parameters:

| Parameter       | Type      | Constraints    | Validation Rules                                   |
| --------------- | --------- | -------------- | -------------------------------------------------- |
| **Side**        | `string`  | `'s'` or `'b'` | Must be exactly one of the allowed values          |
| **Quantity**    | `integer` | 1 - 500,000    | Positive integer within range, unit: USD           |
| **Leverage**    | `integer` | 1 - 100        | Positive integer within range                      |
| **Entry Price** | `number`  | Step: 0.5      | Positive number, rounded to nearest 0.5, unit: USD |

### Output Specifications

Calculated fields must conform to these standards:

| Field                 | Format          | Unit | Precision              |
| --------------------- | --------------- | ---- | ---------------------- |
| **Margin**            | Positive number | sats | Rounded to nearest int |
| **Liquidation Price** | Positive number | USD  | Rounded to nearest 0.5 |

## Technical Implementation

### Frontend

- A form component with validation
- Simple TailwindCSS styling
- Client-side validation
- Table of stored orders, who should be always up to date with DB

### Backend

- Database storage, create a table called `orders` where your store all orders parameters
- tRPC mutation for sending the order
- Basic server side validation of the client input

## Additional Notes

[Don't trust verify](https://glossary.bitbo.io/dont-trust-verify/)

Feel free to implement additional features or improvements beyond these requirements, provided you can justify their inclusion.
