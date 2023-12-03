import json
import boto3

dynamodb=boto3.client('dynamodb')

def lambda_handler(event, context):
    try:
        table_name = 'carttable'  
        data = json.loads(event['body'])
        print('Data:', data)  # Add print statement here

        # Extract menu item details from the request
        menu_name = data.get('MenuName', '')
        rest_name=data.get('RestaurantName', '')
        # reservation_id = data.get('ReservId', '')
        user_name = data.get('UserName', '')
        quantity = data.get('Quantity', '')
        print('Menu:', menu_name)
        print('Restaurant:', rest_name)
        print('User:', user_name)
        print('Quantity:', quantity)
        # Create an item to put in the DynamoDB table
        item = {
            'MenuName': {'S': menu_name},
            'RestaurantName': {'S': rest_name},
            # 'ReservId': {'S': reservation_id},
            'UserName': {'S': user_name},
            'Quantity': {'N': quantity},
        }

        # Put the item in the DynamoDB table
        dynamodb.put_item(TableName=table_name, Item=item)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Menu item added successfully'})
        }
    except Exception as e:
        print('Error:', e)  # Add print statement for error
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal Server Error', 'error': str(e)})
        }
