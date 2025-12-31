import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.LETTERS_TABLE!;
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

interface Letter {
  id: string;
  childName: string;
  message: string;
  receivedDate: string;
  replied: boolean;
}

async function generateMagicReply(childName: string, originalMessage: string): Promise<string> {
  const prompt = `You are Santa Claus, writing a personalized reply to a child's letter. The child is named ${childName}, and their letter says: "${originalMessage}"

Please write a warm, magical, and personalized response from Santa Claus. Include:
- A warm greeting using the child's name
- Reference to something specific from their letter if possible
- Encouragement about being on the Nice List
- Mention of Christmas magic, elves, or reindeer
- A reminder about cookies and milk for Santa and carrots for reindeer
- A cheerful sign-off from Santa

Keep the tone joyful, magical, and fatherly. Use Christmas emojis sparingly but effectively. Make it feel personal and special.

Response:`;

  try {
    const command = new InvokeModelCommand({
      modelId: 'amazon.titan-text-express-v1',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: 300,
          temperature: 0.7,
          topP: 0.9,
        }
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return responseBody.results[0].outputText.trim();
  } catch (error) {
    console.error('Error generating reply with Bedrock:', error);

    // Fallback to predefined replies if Bedrock fails
    const replies = [
      `Ho Ho Ho, dear ${childName}! 🎅\n\nThank you so much for your wonderful letter! Mrs. Claus and I read every word, and the elves were so happy to hear from you.\n\nI've noted your wishes in my special book, and I can see you've been working very hard to be on the Nice List. Keep up the wonderful work!\n\nRemember to leave out some cookies and milk on Christmas Eve, and don't forget the carrots for my reindeer - especially Rudolph, he loves them!\n\nWith lots of Christmas magic and joy,\n🎄 Santa Claus`,
      `Dear ${childName}, Ho Ho Ho! 🎁\n\nWhat a lovely letter you've sent to the North Pole! It made its way through the magical mailbox just perfectly.\n\nI've been watching, and I must say - you've been doing a fantastic job this year! The elves are already working on something very special for you.\n\nDon't forget to dream of sugarplums and be kind to everyone around you. That's the true Christmas spirit!\n\nSending you warm hugs from the North Pole,\n🦌 Santa & the Reindeer Team`,
    ];

    return replies[Math.floor(Math.random() * replies.length)];
  }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, body } = event;

    switch (httpMethod) {
      case 'GET':
        // Get all letters
        const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(result.Items || [])
        };

      case 'POST':
        if (event.path.endsWith('/reply')) {
          // Generate magic reply using AI
          const { childName, originalMessage } = JSON.parse(body || '{}');

          const reply = await generateMagicReply(childName, originalMessage);

          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(reply)
          };
        }

        // Add new letter (if needed)
        const letterData: Omit<Letter, 'id'> = JSON.parse(body || '{}');
        const newId = Date.now().toString();
        const newLetter: Letter = { ...letterData, id: newId };

        await dynamoDb.put({
          TableName: TABLE_NAME,
          Item: newLetter
        }).promise();

        return {
          statusCode: 201,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(newLetter)
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