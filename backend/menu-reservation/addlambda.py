import json
import boto3

dynamodb=boto3.client('dynamodb')

def lambda_handler(event, context):
    try:
        table_name = 'carttable'  # Replace with your DynamoDB table name
        data = json.loads(event['body'])

        # Extract menu item details from the request
        menu_name = data.get('MenuName', '')
        reservation_id = data.get('ReservId', '')
        user_id = data.get('UserId', '')
        quantity = data.get('Quantity', '')
      
        # Create an item to put in the DynamoDB table
        item = {
            'MenuName': {'S': menu_name},
            'ReservId': {'S': reservation_id},
            'UserId': {'S': user_id},
            'Quantity': {'N': quantity},
        }

        # Put the item in the DynamoDB table
        dynamodb.put_item(TableName=table_name, Item=item)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Menu item added successfully'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal Server Error', 'error': str(e)})
        }