# Implement Basic Fund Transfer

Please refer to the [README](../README.md) for instructions on how to run the project and what we expect from you.

## Description

Create a simple interface letting a user send funds from their balance to another user's balance.
This feature should simulate a basic money transfer system where users can send funds to other users within the platform.

## Requirements

### Input Fields

1. **Sender**
   - Type: string, the user email
   - Must be a valid email format
   - Cannot be the same as the sender's email

2. **Recipient**
   - Type: string, the user email
   - Must be a valid email format

3. **Amount**
   - Type: integer, the amount to transfer
   - Must be greater than 0
   - Cannot exceed sender's current balance
   - Should have input validation for numeric values only

## Technical Implementation

### Frontend

- Up-to-date balance display in the users list
- Basic React form component
- Simple TailwindCSS styling
- Basic client-side validation
- Display useful errors from the back-end

### Backend

- Single tRPC mutation endpoint for transferring funds
- Basic input validation
- Error handling (e.g. invalid email, insufficient balance, etc.)
- Database updates (a table to store the transfer history)

## Additional Notes

Feel free to implement additional features or improvements beyond these requirements, provided you can justify their inclusion.
