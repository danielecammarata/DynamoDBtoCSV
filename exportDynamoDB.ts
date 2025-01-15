import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { createObjectCsvWriter } from "csv-writer";
import minimist from "minimist";

// Function to get input parameters using minimist
export function getInputParams() {
  const args = minimist(process.argv.slice(2), {
    default: {
      region: "eu-west-1", // Default region if not passed
      outputFile: "output.csv", // Default output file if not passed
    },
  });

  // Ensure the table name is passed
  if (!args.tableName) {
    throw new Error("Error: You must provide the table name with --tableName");
  }

  return args;
}

// Function to fetch data from DynamoDB
export async function fetchDataFromDynamoDB(region: string, tableName: string) {
  const client = new DynamoDBClient({ region });

  let lastEvaluatedKey;
  let items: any[] = [];

  do {
    const params: any = {
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    const command = new ScanCommand(params);
    const data = await client.send(command);

    // Unmarshall items
    if (data.Items) {
      const unmarshalledItems = data.Items.map(item => unmarshall(item));
      items = [...items, ...unmarshalledItems];
    }

    lastEvaluatedKey = data.LastEvaluatedKey;
  } while (lastEvaluatedKey); // Continue scanning if there's more data

  client.destroy(); // Close the DynamoDB client connection
  return items;
}

// Function to convert data to CSV
export async function exportToCSV(data: any[], outputFile: string) {
  // Check if there is data to write
  if (data.length === 0) {
    console.log("No data found in the DynamoDB table.");
    return;
  }

  // Determine the headers dynamically based on the data keys
  const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));

  const csvWriter = createObjectCsvWriter({
    path: outputFile, // The file to save the data
    header: headers,
  });

  try {
    await csvWriter.writeRecords(data);
    console.log(`Data successfully exported to '${outputFile}'`);
  } catch (err) {
    console.error("Error writing CSV file:", err);
  }
}

// Main function to fetch and export data
async function main() {
  const { region, tableName, outputFile } = getInputParams(); // Get input parameters

  try {
    console.log(`Fetching data from DynamoDB table: ${tableName} in region: ${region}...`);
    const data = await fetchDataFromDynamoDB(region, tableName);

    console.log(`Found ${data.length} items. Exporting to CSV...`);
    await exportToCSV(data, outputFile);
  } catch (err) {
    console.error("Error exporting data:", err);
  }
}

// Execute the main function
if (process.env.NODE_ENV !== 'test') {
  main();  
}
