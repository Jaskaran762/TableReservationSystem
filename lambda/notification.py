import uuid
import boto3
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import pytz



cred = credentials.Certificate("legend-command-302045-firebase-adminsdk-s7bu2-1di3816osk.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://legend-command-302045.firebaseio.com'
})

db = firestore.client()


sqs = boto3.client('sqs')
sns = boto3.client('sns')

def handler(event, context):
    print("event", event)
    requestBody = event

    customer_id = requestBody['customer_id']
    restaurant_id = requestBody['restaurant_id']
    reservation_date = requestBody['reservation_date']
    reservation_time = requestBody['reservation_time']
    table_number = requestBody['table_number']
    number_of_guests = requestBody['number_of_guests']
    special_requests = requestBody['special_requests']
    menu_items = requestBody['menu_items']

    reservation_id = str(uuid.uuid4())

    startTime, endTime = reservation_time.split(" - ")

    halifax_tz = pytz.timezone('America/Halifax')
    reservation_datetime = datetime.strptime(f"{reservation_date} {startTime}", "%Y-%m-%d %H:%M")
    reservation_datetime = halifax_tz.localize(reservation_datetime)

    bookingExpirationTime = (reservation_datetime - timedelta(hours=1)).isoformat()
    reservationsCollection = db.collection("reservations")
    reservationData = {
        'reservation_id': reservation_id,
        'customer_id': customer_id,
        'restaurant_id': restaurant_id,
        'reservation_date': reservation_date,
        'reservation_time': reservation_time,
        'table_number': table_number,
        'number_of_guests': number_of_guests,
        'special_requests': special_requests,
        'menu_items': menu_items,
        'reservation_datetime': reservation_datetime.isoformat(),
        'booking_time': datetime.now(halifax_tz).isoformat(),
        'booking_expiration_time': bookingExpirationTime
    }

    try:
        reservationsCollection.document(reservation_id).set(reservationData)
        createdReservation = reservationData
        notifyTime = (reservation_datetime - timedelta(minutes=30)).isoformat()

        delay_seconds = max(0, (datetime.fromisoformat(notifyTime) - datetime.now(halifax_tz)).seconds)
        sqsMessage = {
            'QueueUrl': 'https://sqs.us-east-1.amazonaws.com/083458079361/SQSPool',
            'MessageBody': str({
                'customer_id': customer_id,
                'reservation_id': reservation_id,
                'notifyTime': notifyTime
            }),
            'DelaySeconds': delay_seconds
        }

        sqs.send_message(**sqsMessage)

        # Sending immediate notification to the user via SNS
        message = f"Your table has been booked at the hotel {restaurant_id} with table number {table_number}."
        snsParams = {
            'Message': message,
            'Subject': 'Table Reservation Confirmation',
            'TopicArn': 'arn:aws:sns:us-east-1:083458079361:SNSTopic'
        }

        sns.publish(**snsParams)

        return {
            'statusCode': 200,
            'body': {
                'message': 'Reservation created successfully.',
                'reservation': createdReservation
            }
        }
    except Exception as error:
        print("Failed to create reservation:", error)
        return {
            'statusCode': 500,
            'body': {'message': 'Failed to create reservation.'}
        }
