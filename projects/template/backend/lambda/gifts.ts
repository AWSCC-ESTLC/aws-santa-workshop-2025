import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.GIFTS_TABLE!;

interface Gift {
  id: string;
  childId: string;
  childName: string;
  giftName: string;
  status: 'manufacturing' | 'wrapping' | 'ready' | 'delivered';
  priority: 'low' | 'medium' | 'high';
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, pathParameters, body } = event;

    switch (httpMethod) {
      case 'GET':
        if (event.path.endsWith('/progress')) {
          // Get gift progress stats
          const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
          const gifts = result.Items as Gift[] || [];

          const stats = {
            manufacturing: gifts.filter(g => g.status === 'manufacturing').length,
            wrapping: gifts.filter(g => g.status === 'wrapping').length,
            ready: gifts.filter(g => g.status === 'ready').length,
            delivered: gifts.filter(g => g.status === 'delivered').length,
          };

          const progressStats = [
            { label: 'Manufacturing', value: stats.manufacturing, color: 'hsl(38 92% 50%)' },
            { label: 'Wrapping', value: stats.wrapping, color: 'hsl(0 76% 42%)' },
            { label: 'Ready', value: stats.ready, color: 'hsl(144 61% 20%)' },
            { label: 'Delivered', value: stats.delivered, color: 'hsl(142 76% 36%)' },
          ];

          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(progressStats)
          };
        } else {
          // Get all gifts
          const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(result.Items || [])
          };
        }

      case 'PUT':
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Gift ID required' })
          };
        }

        const { status } = JSON.parse(body || '{}');

        const result = await dynamoDb.update({
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
          body: JSON.stringify(result.Attributes)
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