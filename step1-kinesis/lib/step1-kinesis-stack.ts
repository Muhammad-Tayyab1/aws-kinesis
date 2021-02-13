import * as cdk from '@aws-cdk/core';
import * as kinesis from '@aws-cdk/aws-kinesis'
import { Duration } from '@aws-cdk/core';
export class Step1KinesisStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stream= new kinesis.Stream(this, 'kinesis Stream',{
      shardCount: 1,
      streamName: 'My-stream',
      retentionPeriod: Duration.hours(24)
    })
  }
}
