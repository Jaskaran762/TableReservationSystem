const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const reviewData = JSON.parse(event.body);
        console.log(reviewData);
        const restaurantId = reviewData.restaurant_id;

        const existingData = await getRestaurantData(reviewData.name);
        console.log(existingData);
        
        existingData['Items'][0].reviewList.push({
            author: reviewData.author,
            description: reviewData.description,
            rating: reviewData.rating,
            review_id: existingData['Items'][0].reviewList.length + 1
        });
        console.log(existingData['Items'][0].reviewList);

        await updateRestaurantData(existingData['Items'][0]);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Review added successfully' })
        };
    } catch (error) {
        console.error('Error adding review:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error adding review' })
        };
    }
};

async function getRestaurantData(name) {
    const params = {
        TableName: 'Restaurant',
    };

    try {
        if (name != null) {
            if (!params.FilterExpression) {
                params.FilterExpression = '';
            }

            params.FilterExpression += '#name = :name';
            params.ExpressionAttributeNames = {
                ...(params.ExpressionAttributeNames || {}),
                '#name': 'name',
            };
            params.ExpressionAttributeValues = {
                ...(params.ExpressionAttributeValues || {}),
                ':name': name,
            };
        }

        const result = await dynamoDB.scan(params).promise();
        return result;
    } catch (error) {
        console.error('Error:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: `Error: ${error.message}`
            })
        };
    }
}

async function updateRestaurantData(data) {
    const params = {
        TableName: 'Restaurant',
        Item: data
    };

    await dynamoDB.put(params).promise();
}
