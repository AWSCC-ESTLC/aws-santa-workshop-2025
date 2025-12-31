import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.REINDEERS_TABLE!;

interface Reindeer {
  id: string;
  name: string;
  status: 'resting' | 'training' | 'flying';
  location: string;
  energyLevel: number;
}

// Predefined locations for different activities
const LOCATIONS = {
  resting: [
    'North Pole Stable',
    'Reindeer Rest Area',
    'Cozy Barn',
    'Warm Lodge'
  ],
  training: [
    'Training Grounds',
    'Obstacle Course',
    'Flight Simulator',
    'Strength Training Area',
    'Agility Field'
  ],
  flying: [
    'Test Route Alpha',
    'Test Route Beta',
    'Speed Test Track',
    'Endurance Circuit',
    'Navigation Challenge'
  ]
};

// Status transition probabilities
const STATUS_TRANSITIONS = {
  resting: { resting: 0.7, training: 0.2, flying: 0.1 },
  training: { resting: 0.3, training: 0.5, flying: 0.2 },
  flying: { resting: 0.4, training: 0.3, flying: 0.3 }
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getNextStatus(currentStatus: Reindeer['status']): Reindeer['status'] {
  const transitions = STATUS_TRANSITIONS[currentStatus];
  const random = Math.random();
  let cumulative = 0;

  for (const [status, probability] of Object.entries(transitions)) {
    cumulative += probability;
    if (random <= cumulative) {
      return status as Reindeer['status'];
    }
  }

  return currentStatus; // fallback
}

function updateEnergyLevel(currentEnergy: number, newStatus: Reindeer['status']): number {
  let energyChange = 0;

  switch (newStatus) {
    case 'resting':
      energyChange = Math.random() * 5 + 2; // +2 to +7
      break;
    case 'training':
      energyChange = -(Math.random() * 3 + 1); // -1 to -4
      break;
    case 'flying':
      energyChange = -(Math.random() * 5 + 3); // -3 to -8
      break;
  }

  const newEnergy = Math.max(0, Math.min(100, currentEnergy + energyChange));
  return Math.round(newEnergy);
}

export const handler = async (event: any) => {
  try {
    console.log('Starting reindeer position updates...');

    // Get all reindeers
    const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
    const reindeers = result.Items as Reindeer[];

    console.log(`Found ${reindeers.length} reindeers to update`);

    // Update each reindeer
    for (const reindeer of reindeers) {
      const newStatus = getNextStatus(reindeer.status);
      const newLocation = getRandomElement(LOCATIONS[newStatus]);
      const newEnergyLevel = updateEnergyLevel(reindeer.energyLevel, newStatus);

      await dynamoDb.update({
        TableName: TABLE_NAME,
        Key: { id: reindeer.id },
        UpdateExpression: 'SET #status = :status, #location = :location, energyLevel = :energyLevel',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#location': 'location'
        },
        ExpressionAttributeValues: {
          ':status': newStatus,
          ':location': newLocation,
          ':energyLevel': newEnergyLevel
        }
      }).promise();

      console.log(`${reindeer.name}: ${reindeer.status} → ${newStatus}, ${reindeer.location} → ${newLocation}, Energy: ${reindeer.energyLevel} → ${newEnergyLevel}`);
    }

    console.log('Reindeer position updates completed');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Reindeer positions updated successfully',
        updatedCount: reindeers.length
      })
    };

  } catch (error) {
    console.error('Error updating reindeer positions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to update reindeer positions',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};