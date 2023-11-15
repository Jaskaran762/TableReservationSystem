const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const lambda = new AWS.Lambda();

exports.handler = async (event, context) => {
    // Example input JSON
    console.log(event);
    const inputJson = event;
    console.log(inputJson);
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
    if (inputJson.city != null ) {
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
    if (!isNaN(inputJson.rating)) {
      if (params.FilterExpression != '') {
        params.FilterExpression += ' AND '; // Add AND if 'city' condition exists
      }
      params.FilterExpression += '#resRating >= :ratingValue';
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
    var result = await dynamoDB.scan(params).promise();
    if (inputJson.availability) {
      const paramForLambda = {
      FunctionName: 'filter-restaurant-availability',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload: JSON.stringify(result), 
      };
      result = await lambda.invoke(paramForLambda).promise();
    }
    
    const newArray = result.Items.map(item => ({
    city: item.city,
    openingTime: item.openingTime,
    closingTime: item.closingTime,
    location: item.location,
    name: item.name,
    photo: item.photo,
    resRating: item.resRating
    }));
    console.log(newArray);
    return { restaurants: newArray};
  } catch (err) {
    console.error('Error retrieving items from DynamoDB:', err);
    return { restaurants: `Error retrieving items from DynamoDB: ${err.message}` };
  }
};
