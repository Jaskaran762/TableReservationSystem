import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import boto3
from botocore.exceptions import ClientError

def get_secret():

    secret_name = "gmail_credentials"
    region_name = "us-east-1"

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        raise e

    secret = get_secret_value_response['SecretString']
    secret = json.loads(secret);

    return secret;


def send_email(subject, body, to_email):
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    email_credentials = get_secret();
    smtp_username = email_credentials["email"]
    smtp_password = email_credentials["password"]

    sender_email = smtp_username
    receiver_email = to_email

    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = receiver_email
    message['Subject'] = subject

    message.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(sender_email, receiver_email, message.as_string())

    print("Email sent successfully.")

def lambda_handler(event, context):
    print(event);
    subject = event["subject"]
    body = event["message"]
    to_email = event["email"]
    get_secret();
    send_email(subject, body, to_email)
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
