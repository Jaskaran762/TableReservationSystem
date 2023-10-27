import json
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.client('dynamodb')
    try:
        table_name = 'carttable'  # The name of your DynamoDB table
        response = dynamodb.scan(TableName=table_name)
        
        items = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'body': json.dumps(items)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal Server Error', 'error': str(e)})
        }
