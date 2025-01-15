# DynamoDB to CSV Exporter

This script exports data from an AWS DynamoDB table to a local CSV file. You can specify the AWS region, the DynamoDB table name, and the output file name via command-line parameters.

## Prerequisites

- **Node.js** (>=v18.0) or **Bun** (v0.5.0 or later) to run the script.
- **AWS credentials** configured on your system. Ensure your AWS credentials (Access Key ID and Secret Access Key) are set in the environment variables or configured via the AWS CLI.

## Dependencies

The script requires the following dependencies:
- `@aws-sdk/client-dynamodb` – AWS SDK for DynamoDB.
- `@aws-sdk/lib-dynamodb` – Utility functions for DynamoDB data formatting.
- `csv-writer` – A library for writing CSV files.
- `minimist` – A command-line argument parser.

## Installation

### Using Bun

1. Install the dependencies using Bun:
   ```bash
   bun add @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb csv-writer minimist
   ```

2. Clone or copy the script file to your project folder.

### Using npm (Alternative)

1. Create a new Node.js project (if you don't have one already):
   ```bash
   npm init -y
   ```

2. Install the required dependencies:
   ```bash
   npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb csv-writer minimist
   ```

3. Add the TypeScript script to your project folder.

## Usage

You can run the script using **Bun** or **Node.js** with the following command-line parameters:

### Command-Line Parameters

- `--region`: The AWS region where your DynamoDB table is located (default: `eu-west-1`).
- `--tableName`: The name of your DynamoDB table (required).
- `--outputFile`: The path to the output CSV file (default: `output.csv`).

### Example Commands

1. **Basic usage with default region and output file:**

   This will use the default AWS region `eu-west-1` and output the data to `output.csv`:
   ```bash
   bun run exportDynamoDB.ts --tableName MyDynamoDBTable
   ```

2. **Specifying a custom region and output file:**

   This will use the `us-east-1` region and output to `data.csv`:
   ```bash
   bun run exportDynamoDB.ts --region us-east-1 --tableName MyDynamoDBTable --outputFile data.csv
   ```

3. **Full command with all parameters:**

   ```bash
   bun run exportDynamoDB.ts --region us-west-2 --tableName MyDynamoDBTable --outputFile my_table_data.csv
   ```

## Script Behavior

1. **Fetching Data from DynamoDB:**
   - The script performs a **scan** operation on the DynamoDB table. It handles pagination using `LastEvaluatedKey` to fetch all items from the table if there are more than one page of results.

2. **CSV Export:**
   - The script generates a CSV file containing the attributes of all items from the table.
   - The headers are dynamically generated based on the attribute names from the first item of the table.

3. **Error Handling:**
   - The script will exit with an error if the `--tableName` parameter is missing.
   - If any errors occur while exporting to the CSV file, they will be logged.

## Example Output

If you run the script with the following command:

```bash
bun run exportDynamoDB.ts --tableName UsersTable --region us-west-1 --outputFile users.csv
```

The script will generate a file `users.csv` containing all the items from the `UsersTable` in the `us-west-1` region.

### Example `users.csv`:

```csv
id,name,email
1,John Doe,john@example.com
2,Jane Smith,jane@example.com
...
```

## Notes

- **Scan Efficiency:** The `ScanCommand` retrieves all items from the table, which can be inefficient for large tables. Consider using `QueryCommand` with specific key values for better performance if you need a subset of data.
- **Large Tables:** If your DynamoDB table has a large number of items, the script will automatically handle pagination and fetch all the items.
- **Default Output:** If no `--outputFile` parameter is provided, the file will be saved as `output.csv`.

## Troubleshooting

- **AWS Credentials Not Found:**
  If you encounter errors related to AWS credentials, ensure that your credentials are set up correctly using the AWS CLI:
  ```bash
  aws configure
  ```

- **Missing Required Parameters:**
  If the `--tableName` parameter is missing, the script will output an error and stop. Ensure you provide the table name when running the script.

## License

This script is released under the MIT License. See the LICENSE file for more details.
