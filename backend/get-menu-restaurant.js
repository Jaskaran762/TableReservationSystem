const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
    // Get the name from the input event
    const body = JSON.parse(event.body);
    const name = body.name
    console.log(name);

    // Initialize DynamoDB client
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // DynamoDB Query parameters
    const params = {
        TableName: 'Restaurant',
    };

    try {
        // Check if 'name' is not null
        if (name != null) {  // Fix: Use 'name' instead of inputJson.name
            // Initialize the filter expression if not already initialized
            if (!params.FilterExpression) {
                params.FilterExpression = '';
            }

            // Fix: Use the correct syntax for updating FilterExpression, ExpressionAttributeNames, and ExpressionAttributeValues
            params.FilterExpression += '#name = :name';
            params.ExpressionAttributeNames = {
                ...(params.ExpressionAttributeNames || {}),  // Ensure existing ExpressionAttributeNames are retained
                '#name': 'name',
            };
            params.ExpressionAttributeValues = {
                ...(params.ExpressionAttributeValues || {}),  // Ensure existing ExpressionAttributeValues are retained
                ':name': name,
            };
        }


        // Call DynamoDB to scan the table based on the conditions
        var result = await dynamodb.scan(params).promise();
        
        console.log(result['Items'][0]['menuList']);

        const reviewList = result['Items'][0]['menuList'];

        return {
            statusCode: 200,
            body: JSON.stringify(reviewList)
        };
    } catch (error) {
        console.error('Error:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: `Error: ${error.message}`
            })
        };
    }
};
