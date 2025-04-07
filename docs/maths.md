# Formulas

## Variables

|      | Description           | Unit    | Precision |
| ---- | --------------------- | ------- | --------- |
| side | 1 if buy / -1 if sell |         |           |
| Q    | quantity              | Dollar  | 0.5       |
| EP   | entryPrice            | Dollar  | 0.5       |
| Le   | leverage              |         | 0.001     |
| M    | margin                | Satoshi |           |
| Li   | liquidation           | Dollar  | 0.5       |

## Table

|             | Leverage                          | Margin                                  | Liquidation                                       |
| ----------- | --------------------------------- | --------------------------------------- | ------------------------------------------------- |
| Leverage    | Input                             | $\frac{Q}{EP \cdot M}$                  | $\frac{Li \cdot s}{EP - Li}$                      |
| Margin      | $\frac{Q}{EP} \cdot \frac{1}{Le}$ | Input                                   | $\frac{Q \cdot (EP - Li)}{EP \cdot (Li \cdot s)}$ |
| Liquidation | $EP \cdot Le / (Le + s)$          | $EP \cdot Q / (Q + s \cdot EP \cdot M)$ | Input                                             |
