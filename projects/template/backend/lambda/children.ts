import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.CHILDREN_TABLE!;

interface Child {
  id: string;
  name: string;
  age: number;
  country: string;
  status: 'nice' | 'naughty';
  wishlist: string[];
  niceScore: number;
}

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
        if (pathParameters?.id) {
          // Get single child
          const result = await dynamoDb.get({
            TableName: TABLE_NAME,
            Key: { id: pathParameters.id }
          }).promise();

          if (!result.Item) {
            return {
              statusCode: 404,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({ error: 'Child not found' })
            };
          }

          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(result.Item)
          };
        } else if (event.queryStringParameters?.query) {
          // Search children
          const query = event.queryStringParameters.query.toLowerCase();
          const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
          const children = result.Items?.filter(child =>
            child.name.toLowerCase().includes(query) ||
            child.country.toLowerCase().includes(query)
          ) || [];

          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(children)
          };
        } else {
          // Get all children
          const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(result.Items || [])
          };
        }

      case 'POST':
        // Add new child
        const childData: Omit<Child, 'id'> = JSON.parse(body || '{}');
        const newId = Date.now().toString();
        const newChild: Child = { ...childData, id: newId };

        await dynamoDb.put({
          TableName: TABLE_NAME,
          Item: newChild
        }).promise();

        // Auto-create gifts from wishlist for nice children
        const newGifts: Gift[] = [];
        if (childData.status === 'nice' && childData.wishlist.length > 0) {
          const GIFTS_TABLE = process.env.GIFTS_TABLE!;
          for (let i = 0; i < childData.wishlist.length; i++) {
            const gift: Gift = {
              id: `${newId}-${i}`,
              childId: newId,
              childName: childData.name,
              giftName: childData.wishlist[i],
              status: 'manufacturing',
              priority: childData.niceScore >= 90 ? 'high' : childData.niceScore >= 70 ? 'medium' : 'low'
            };

            await dynamoDb.put({
              TableName: GIFTS_TABLE,
              Item: gift
            }).promise();
            newGifts.push(gift);
          }
        }

        return {
          statusCode: 201,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ child: newChild, gifts: newGifts })
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