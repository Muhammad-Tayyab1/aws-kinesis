import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as kinesis from '@aws-cdk/aws-kinesis';
import *as lambda from '@aws-cdk/aws-lambda';

export class AwsKinesisStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stream = new kinesis.Stream(this, 'stream', {
      shardCount: 1,
    });

    const streamConsumer = new kinesis.CfnStreamConsumer(this, 'stream-consumer', {
      consumerName: 'example-stream-consumer',
      streamArn: stream.streamArn,
    });
    const producer = new lambda.Function(this, 'producer', {
      code: lambda.Code.fromAsset('src'),
      description: 'Example Lambda to put events into Kinesis.',
      environment: {
        'STREAM_NAME': stream.streamName,
      },
      functionName: 'example-producer',
      handler: 'producer.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
    });

    const kinesisStreamWritePolicyStmt = new iam.PolicyStatement({
      resources: [stream.streamArn],
      actions: ['kinesis:PutRecord'],
    });

    producer.addToRolePolicy(kinesisStreamWritePolicyStmt);

    const lambdaConsumer = new lambda.Function(this, 'lambda-consumer', {
      code: lambda.Code.fromAsset('src'),
      description: 'Example Lambda to consume events from Kinesis.',
      functionName: 'example-consumer',
      handler: 'consumer.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
    });

    const lambdaRole = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Example role...',
    })
    const kinesisStreamReadPolicyStmt = new iam.PolicyStatement({
      resources: [stream.streamArn],
      actions: [
        'kinesis:DescribeStreamSummary',
        'kinesis:GetRecords',
        'kinesis:GetShardIterator',
        'kinesis:ListShards',
      ],
    });

    const kinesisConsumerPolicyStmt = new iam.PolicyStatement({
      resources: [streamConsumer.attrConsumerArn],
      actions: ['kinesis:SubscribeToShard'],
    });

    lambdaConsumer.addToRolePolicy(kinesisStreamReadPolicyStmt);
    lambdaConsumer.addToRolePolicy(kinesisConsumerPolicyStmt);

    new lambda.EventSourceMapping(this, 'event-source-mapping', {
      batchSize: 10,
      eventSourceArn: streamConsumer.attrConsumerArn,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      target: lambdaConsumer,
    });

    // const lambdaRole = new iam.Role(this, 'Role', {
    //   assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    //   description: 'Example role...',
    // })
    // const stream = new kinesis.Stream(this, 'MyEncryptedStream', {
    //     encryption: StreamEncryption.KMS
    // });
    
    // // give lambda permissions to read stream
    // stream.grantReadWrite(lambdaRole);
    
  }
}
