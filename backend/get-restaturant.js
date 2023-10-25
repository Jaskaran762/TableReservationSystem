const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.handler = async (event, context) => {
  // Example input JSON
  const inputJson = event;

  // DynamoDB Query parameters
  const params = {
    TableName: 'Restaurant',
  };

  // Check if 'name' is not null
  if (inputJson.name != null) {
    // Initialize the filter expression if not already initialized
    if (!params.FilterExpression) {
      params.FilterExpression = '';
    }

    params.FilterExpression += '#name = :name';
    params.ExpressionAttributeNames = {
      ...params.ExpressionAttributeNames,
      '#name': 'name',
    };
    params.ExpressionAttributeValues = {
      ...params.ExpressionAttributeValues,
      ':name': inputJson.name,
    };
  }

  // Check if 'city' and 'rating' are not null in the input JSON
  if (inputJson.city != null || inputJson.rating != null) {
    // Initialize the filter expression if not already initialized
    if (!params.FilterExpression) {
      params.FilterExpression = '';
    }

    // Check and add 'city' condition
    if (inputJson.city != null) {
      params.FilterExpression += '#city = :cityValue';
      params.ExpressionAttributeNames = {
        ...params.ExpressionAttributeNames,
        '#city': 'city',
      };
      params.ExpressionAttributeValues = {
        ...params.ExpressionAttributeValues,
        ':cityValue': inputJson.city,
      };
    }

    // Check and add 'rating' condition
    if (inputJson.rating != null) {
      if (params.FilterExpression != '') {
        params.FilterExpression += ' AND '; // Add AND if 'city' condition exists
      }
      params.FilterExpression += '#resRating <= :ratingValue';
      params.ExpressionAttributeNames = {
        ...params.ExpressionAttributeNames,
        '#resRating': 'resRating', // Assuming 'rating' is the attribute name in DynamoDB
      };
      params.ExpressionAttributeValues = {
        ...params.ExpressionAttributeValues,
        ':ratingValue': parseInt(inputJson.rating),
      };
    }
  }

  try {
    console.log(params.FilterExpression);
    // Call DynamoDB to scan the table based on the conditions
    const result = await dynamoDB.scan(params).promise();

    // Print items to the console
    console.log('Items retrieved from DynamoDB based on input conditions:');
    result.Items.forEach(item => {
      console.log(JSON.stringify(item, null, 2));
    });

    return { statusCode: 200, body: JSON.stringify(result) , input: JSON.stringify(params.FilterExpression)};
  } catch (err) {
    console.error('Error retrieving items from DynamoDB:', err);
    return { statusCode: 500, body: `Error retrieving items from DynamoDB: ${err.message}` };
  }
};
