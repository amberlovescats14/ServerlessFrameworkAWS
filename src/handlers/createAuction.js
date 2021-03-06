import {v4 as uuid} from 'uuid';
import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const {title} = event.body;
  const now = new Date();
  const auction = {
    id: uuid(),
    title,
    status: 'Open',
    createdAt: now.toISOString()
  };
  console.log(`Name: ${process.env.AUCTIONS_TABLE_NAME}`)
  try {
    await dynamoDB.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction
    }).promise();
  } catch (error) {
    console.log(`PUT error: ${error}`);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction)
  };
}

export const handler = middy(createAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());


