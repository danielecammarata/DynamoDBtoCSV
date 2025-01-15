import { describe, it, expect, vi } from 'vitest';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { createObjectCsvWriter } from 'csv-writer';

// Import the script's functions (assuming your script is named exportDynamoDB.ts)
import { fetchDataFromDynamoDB, exportToCSV, getInputParams } from './exportDynamoDB';

// Mock the AWS SDK's DynamoDB client and CSV writer
vi.mock('@aws-sdk/client-dynamodb');
vi.mock('@aws-sdk/util-dynamodb');
vi.mock('csv-writer');

// Unit tests
describe('Unit tests for exportDynamoDB script', () => {

  it('should fetch data from DynamoDB', async () => {
    const mockData = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];

    // Mocking the unmarshall function
    vi.mocked(unmarshall).mockImplementation(item => item); // Just returns the item

    // Mocking the DynamoDB client
    const mockSend = vi.fn().mockResolvedValue({
      Items: mockData,
      LastEvaluatedKey: undefined, // No pagination needed for this test
    });
    DynamoDBClient.prototype.send = mockSend;

    const data = await fetchDataFromDynamoDB('us-west-2', 'MyTable');
    
    expect(data).toEqual(mockData); // Check that the returned data matches the mock
    expect(mockSend).toHaveBeenCalledTimes(1); // Check if the send method was called once
  });

  it('should export data to CSV', async () => {
    const mockData = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];

    const mockCsvWriter = {
      writeRecords: vi.fn().mockResolvedValue(true),
    };
    
    // Mocking the CSV writer
    vi.mocked(createObjectCsvWriter).mockReturnValue(mockCsvWriter as any);

    await exportToCSV(mockData, 'output.csv');
    
    expect(mockCsvWriter.writeRecords).toHaveBeenCalledWith(mockData); // Check if writeRecords was called with correct data
    expect(mockCsvWriter.writeRecords).toHaveBeenCalledTimes(1); // Verify that it was called once
  });

  it('should parse command-line arguments correctly', () => {
    const args = ['--region', 'us-west-2', '--tableName', 'MyTable', '--outputFile', 'data.csv'];
    const mockProcessArgv = ['node', 'script.js', ...args]; // Simulate command-line arguments

    vi.spyOn(process, 'argv', 'get').mockReturnValue(mockProcessArgv);

    const parsedArgs = getInputParams();

    expect(parsedArgs.region).toBe('us-west-2');
    expect(parsedArgs.tableName).toBe('MyTable');
    expect(parsedArgs.outputFile).toBe('data.csv');
  });

  it('should use default region if not provided', () => {
    const args = ['--tableName', 'MyTable']; // Only tableName provided
    const mockProcessArgv = ['node', 'script.js', ...args]; // Simulate command-line arguments

    vi.spyOn(process, 'argv', 'get').mockReturnValue(mockProcessArgv);

    const parsedArgs = getInputParams();

    expect(parsedArgs.region).toBe('eu-west-1'); // Default region
    expect(parsedArgs.tableName).toBe('MyTable');
    expect(parsedArgs.outputFile).toBe('output.csv'); // Default output file
  });

  it('should throw an error if tableName is missing', () => {
    const args = ['--region', 'us-west-2']; // Missing tableName
    const mockProcessArgv = ['node', 'script.js', ...args]; // Simulate command-line arguments

    vi.spyOn(process, 'argv', 'get').mockReturnValue(mockProcessArgv);

    expect(() => {
      getInputParams(); // Should throw error since tableName is required
    }).toThrowError('Error: You must provide the table name with --tableName');
  });
});
