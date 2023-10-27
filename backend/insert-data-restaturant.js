const AWS = require('aws-sdk');

// Set up AWS DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
        // Parse the incoming JSON object
        const requestBody = event.body;

        // Define the DynamoDB parameters
        const params = {
            TableName: 'Restaurant', // Replace with your DynamoDB table name
            Item: {
                restaurant_id: requestBody.restaurant_id,
                city: requestBody.city,
                closingTime: requestBody.closingTime,
                location: requestBody.location,
                menuList: requestBody.menuList,
                name: requestBody.name,
                openingTime: requestBody.openingTime,
                photo: requestBody.photo,
                resRating: requestBody.resRating,
                reviewList: requestBody.reviewList
            }
        };

        // Put the item into DynamoDB
        await dynamoDB.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Item inserted successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
