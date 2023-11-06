import json
import boto3

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    try:
        table_name = 'carttable'  # The name of your DynamoDB table
        data = json.loads(event['body'])

        # Extract the reservation ID and menu ID from the request
        reservation_id = data.get('ReservId', '')
        menu_name = data.get('MenuName', '')

         # Specify the key to identify the item to be deleted
        key = {
            'ReservId': { 'S': reservation_id },
            'MenuName': { 'S': menu_name }
        }

        delete_params = {
            'TableName': table_name,
            'Key': key
        }
        dynamodb.delete_item(**delete_params)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Menu item deleted successfully'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal Server Error', 'error': str(e)})
        }   