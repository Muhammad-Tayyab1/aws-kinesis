#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsKinesisStack } from '../lib/aws_kinesis-stack';

const app = new cdk.App();
new AwsKinesisStack(app, 'AwsKinesisStack');
