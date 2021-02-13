import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as kinesis from '@aws-cdk/aws-kinesis';
import { Code, EventSourceMapping, Function, Runtime, StartingPosition } from '@aws-cdk/aws-lambda';

export class AwsKinesisStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stream = new kinesis.Stream(this, 'stream', {
      shardCount: 1,
      streamName: 'example-stream',
    });

    const streamConsumer = new kinesis.CfnStreamConsumer(this, 'stream-consumer', {
      consumerName: 'example-stream-consumer',
      streamArn: stream.streamArn,
    });
    const producer = new Function(this, 'producer', {
      code: Code.fromAsset('src'),
      description: 'Example Lambda to put events into Kinesis.',
      environment: {
        'STREAM_NAME': stream.streamName,
      },
      functionName: 'example-producer',
      handler: 'producer.handler',
      runtime: Runtime.NODEJS_12_X,
    });

    const kinesisStreamWritePolicyStmt = new PolicyStatement({
      resources: [stream.streamArn],
      actions: ['kinesis:PutRecord'],
    });

    producer.addToRolePolicy(kinesisStreamWritePolicyStmt);

    const lambdaConsumer = new Function(this, 'lambda-consumer', {
      code: Code.fromAsset('src'),
      description: 'Example Lambda to consume events from Kinesis.',
      functionName: 'example-consumer',
      handler: 'consumer.handler',
      runtime: Runtime.NODEJS_12_X,
    });

    const kinesisStreamReadPolicyStmt = new PolicyStatement({
      resources: [stream.streamArn],
      actions: [
        'kinesis:DescribeStreamSummary',
        'kinesis:GetRecords',
        'kinesis:GetShardIterator',
        'kinesis:ListShards',
      ],
    });

    const kinesisConsumerPolicyStmt = new PolicyStatement({
      resources: [streamConsumer.attrConsumerArn],
      actions: ['kinesis:SubscribeToShard'],
    });

    lambdaConsumer.addToRolePolicy(kinesisStreamReadPolicyStmt);
    lambdaConsumer.addToRolePolicy(kinesisConsumerPolicyStmt);

    new EventSourceMapping(this, 'event-source-mapping', {
      batchSize: 10,
      eventSourceArn: streamConsumer.attrConsumerArn,
      startingPosition: StartingPosition.TRIM_HORIZON,
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
