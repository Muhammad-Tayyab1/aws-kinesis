#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step1KinesisStack } from '../lib/step1_kinesis-stack';

const app = new cdk.App();
new Step1KinesisStack(app, 'Step1KinesisStack');
