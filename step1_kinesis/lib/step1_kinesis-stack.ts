import * as cdk from '@aws-cdk/core';
import * as kinesis from '@aws-cdk/aws-kinesis'

import * as kms from "@aws-cdk/aws-kms";
import { StreamEncryption } from '@aws-cdk/aws-kinesis';
import { Duration } from '@aws-cdk/core';
export class Step1KinesisStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const key = new kms.Key(this, "MyKey");
    
    const stream = new kinesis.Stream(this, 'New-Stream',{
      encryption: StreamEncryption.KMS,
      shardCount: 3,
      streamName: 'new-stream',
      encryptionKey: key,
    
    })
  }
}
