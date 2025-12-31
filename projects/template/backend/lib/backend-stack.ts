import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const childrenTable = new dynamodb.Table(this, 'SantaChildren', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development
    });

    const giftsTable = new dynamodb.Table(this, 'SantaGifts', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const reindeersTable = new dynamodb.Table(this, 'SantaReindeers', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lettersTable = new dynamodb.Table(this, 'SantaLetters', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Functions
    const childrenFunction = new lambdanode.NodejsFunction(this, 'ChildrenFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/children.ts'),
      environment: {
        CHILDREN_TABLE: childrenTable.tableName,
        GIFTS_TABLE: giftsTable.tableName,
      },
    });

    const giftsFunction = new lambdanode.NodejsFunction(this, 'GiftsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/gifts.ts'),
      environment: {
        GIFTS_TABLE: giftsTable.tableName,
      },
    });

    const reindeersFunction = new lambdanode.NodejsFunction(this, 'ReindeersFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/reindeers.ts'),
      environment: {
        REINDEERS_TABLE: reindeersTable.tableName,
      },
    });

    const lettersFunction = new lambdanode.NodejsFunction(this, 'LettersFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/letters.ts'),
      environment: {
        LETTERS_TABLE: lettersTable.tableName,
      },
    });

    // Add Bedrock permissions to letters function
    lettersFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: ['*'], // In production, restrict to specific models
    }));

    const dashboardFunction = new lambdanode.NodejsFunction(this, 'DashboardFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/dashboard.ts'),
      environment: {
        CHILDREN_TABLE: childrenTable.tableName,
        GIFTS_TABLE: giftsTable.tableName,
        REINDEERS_TABLE: reindeersTable.tableName,
        LETTERS_TABLE: lettersTable.tableName,
      },
    });

    // Grant permissions
    childrenTable.grantReadWriteData(childrenFunction);
    giftsTable.grantReadWriteData(childrenFunction);
    giftsTable.grantReadWriteData(giftsFunction);
    reindeersTable.grantReadWriteData(reindeersFunction);
    lettersTable.grantReadWriteData(lettersFunction);
    childrenTable.grantReadData(dashboardFunction);
    giftsTable.grantReadData(dashboardFunction);
    reindeersTable.grantReadData(dashboardFunction);
    lettersTable.grantReadData(dashboardFunction);

    // Reindeer Position Updater Lambda
    const reindeerUpdaterFunction = new lambdanode.NodejsFunction(this, 'ReindeerUpdaterFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/reindeerUpdater.ts'),
      environment: {
        REINDEERS_TABLE: reindeersTable.tableName,
      },
    });

    reindeersTable.grantReadWriteData(reindeerUpdaterFunction);

    // EventBridge Rule for Reindeer Position Updates (every minute)
    const reindeerUpdateRule = new events.Rule(this, 'ReindeerUpdateRule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
      description: 'Updates reindeer positions every minute',
    });

    reindeerUpdateRule.addTarget(new targets.LambdaFunction(reindeerUpdaterFunction));

    // API Gateway
    const api = new apigateway.RestApi(this, 'SantaCloudAPI', {
      restApiName: 'SantaCloud API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // API Routes
    const childrenResource = api.root.addResource('children');
    childrenResource.addMethod('GET', new apigateway.LambdaIntegration(childrenFunction));
    childrenResource.addMethod('POST', new apigateway.LambdaIntegration(childrenFunction));

    const childResource = childrenResource.addResource('{id}');
    childResource.addMethod('GET', new apigateway.LambdaIntegration(childrenFunction));

    const giftsResource = api.root.addResource('gifts');
    giftsResource.addMethod('GET', new apigateway.LambdaIntegration(giftsFunction));

    const giftResource = giftsResource.addResource('{id}');
    giftResource.addMethod('PUT', new apigateway.LambdaIntegration(giftsFunction));

    const progressResource = giftsResource.addResource('progress');
    progressResource.addMethod('GET', new apigateway.LambdaIntegration(giftsFunction));

    const reindeersResource = api.root.addResource('reindeers');
    reindeersResource.addMethod('GET', new apigateway.LambdaIntegration(reindeersFunction));

    const reindeerResource = reindeersResource.addResource('{id}');
    reindeerResource.addMethod('PUT', new apigateway.LambdaIntegration(reindeersFunction));

    const lettersResource = api.root.addResource('letters');
    lettersResource.addMethod('GET', new apigateway.LambdaIntegration(lettersFunction));
    lettersResource.addMethod('POST', new apigateway.LambdaIntegration(lettersFunction));

    const replyResource = lettersResource.addResource('reply');
    replyResource.addMethod('POST', new apigateway.LambdaIntegration(lettersFunction));

    const dashboardResource = api.root.addResource('dashboard');
    const statsResource = dashboardResource.addResource('stats');
    statsResource.addMethod('GET', new apigateway.LambdaIntegration(dashboardFunction));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
