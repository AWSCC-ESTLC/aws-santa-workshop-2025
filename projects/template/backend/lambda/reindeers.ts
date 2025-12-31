import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.REINDEERS_TABLE!;

interface Reindeer {
  id: string;
  name: string;
  status: 'resting' | 'training' | 'flying';
  location: string;
  energyLevel: number;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, pathParameters, body } = event;

    switch (httpMethod) {
      case 'GET':
        // Get all reindeers
        const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(result.Items || [])
        };

      case 'PUT':
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Reindeer ID required' })
          };
        }

        const { status } = JSON.parse(body || '{}');

        const updateResult = await dynamoDb.update({
          TableName: TABLE_NAME,
          Key: { id: pathParameters.id },
          UpdateExpression: 'SET #status = :status',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':status': status },
          ReturnValues: 'ALL_NEW'
        }).promise();

        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(updateResult.Attributes)
        };

      default:
        return {
          statusCode: 405,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};