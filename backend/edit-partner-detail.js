const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
    try {
        const newPartnerData = event;
        console.log(newPartnerData);

        const existingData = await getRestaurantData(newPartnerData.id);
        console.log(existingData);
        
        if(newPartnerData.operation == 'availablilty'){
          existingData.openingTime = newPartnerData.openingTime;
          existingData.closingTime = newPartnerData.closingTime;
        }
        if(newPartnerData.operation == 'menu'){
          existingData.menuList = newPartnerData.menuList;
        }
        if(newPartnerData.operation =='table'){
          existingData.tables = newPartnerData.tables;
        }
        if(newPartnerData.operation == 'status'){
          existingData.available = newPartnerData.available;
        }
        if(newPartnerData.operation == 'location'){
          existingData.location = newPartnerData.location;
        }
        if(newPartnerData.operation == 'city'){
          existingData.city = newPartnerData.city;
        }
        
        console.log(existingData);

        await updateRestaurantData(existingData);

        return {
            statusCode: 200,
            body: { message: JSON.stringify('Review added successfully') }
        };
    } catch (error) {
        console.error('Error adding review:', error);
        return {
            statusCode: 500,
            body:{ message: JSON.stringify('Error adding review') }
        };
    }
};

async function getRestaurantData(id) {
    const params = {
        TableName: 'Restaurant', 
        Key: {
            'restaurant_id': id
        }
    };

    try {
        // Query DynamoDB for the item with the specified ID
        const data = await dynamoDB.get(params).promise();
        console.log(data);
        return data.Item;
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
