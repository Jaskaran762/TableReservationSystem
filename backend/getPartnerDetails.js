const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    // Retrieve ID from the Lambda event
    
    console.log(event.queryStringParameters.id);
    
    const idToGet = parseInt(event.queryStringParameters.id, 10);

    console.log(idToGet);
    // DynamoDB parameters
    const params = {
        TableName: 'Restaurant', 
        Key: {
            'restaurant_id': idToGet
        }
    };

    try {
        // Query DynamoDB for the item with the specified ID
        const data = await dynamodb.get(params).promise();
        console.log(data);

        // Check if the item was found
        if (data.Item) {
            return {
                statusCode: 200,
                body: JSON.stringify(data.Item)
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify('Item not found')
            };
        }
    } catch (error) {
        console.error('Error retrieving data from DynamoDB:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Internal Server Error')
        };
    }
};
