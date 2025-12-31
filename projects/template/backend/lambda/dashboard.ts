import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();

interface DashboardStats {
  totalChildren: number;
  niceChildren: number;
  naughtyChildren: number;
  giftsReady: number;
  giftsInProgress: number;
  activeReindeers: number;
  unreadLetters: number;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get children stats
    const childrenResult = await dynamoDb.scan({ TableName: process.env.CHILDREN_TABLE! }).promise();
    const children = childrenResult.Items || [];
    const niceCount = children.filter(c => c.status === 'nice').length;

    // Get gifts stats
    const giftsResult = await dynamoDb.scan({ TableName: process.env.GIFTS_TABLE! }).promise();
    const gifts = giftsResult.Items || [];
    const readyGifts = gifts.filter(g => g.status === 'ready').length;

    // Get reindeers stats
    const reindeersResult = await dynamoDb.scan({ TableName: process.env.REINDEERS_TABLE! }).promise();
    const reindeers = reindeersResult.Items || [];
    const activeReindeers = reindeers.filter(r => r.status !== 'resting').length;

    // Get letters stats
    const lettersResult = await dynamoDb.scan({ TableName: process.env.LETTERS_TABLE! }).promise();
    const letters = lettersResult.Items || [];
    const unreadLetters = letters.filter(l => !l.replied).length;

    const stats: DashboardStats = {
      totalChildren: children.length,
      niceChildren: niceCount,
      naughtyChildren: children.length - niceCount,
      giftsReady: readyGifts,
      giftsInProgress: gifts.length - readyGifts,
      activeReindeers,
      unreadLetters,
    };

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(stats)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};