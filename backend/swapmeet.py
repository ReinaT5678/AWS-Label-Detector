import boto3
from PIL import Image
from io import BytesIO
import base64
import uuid

"""fill in credentials"""
AWS_ACCESS_KEY_ID = ''
AWS_SECRET_ACCESS_KEY = ''
AWS_REGION = ''
S3_BUCKET = ''

def upload_to_s3(image_data):
    """Upload image to S3 and return the object key"""
    session = boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    
    s3 = session.resource('s3')
    
    # generate filename
    filename = f"{uuid.uuid4()}.jpg"
    
    # Upload to S3
    s3.Bucket(S3_BUCKET).put_object(
        Key=filename,
        Body=image_data,
        ContentType='image/jpeg'
    )
    
    return filename

def detect_labels(photo_key):
    """Detect labels in the image and return results"""
    session = boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    
    # Create rekognition client
    rekognition = session.client('rekognition')
    
    # Detect labels
    response = rekognition.detect_labels(
        Image={'S3Object': {'Bucket': S3_BUCKET, 'Name': photo_key}},
        MaxLabels=10
    )
    
    # Prepare results
    labels_data = [{
        'name': label['Name'],
        'confidence': label['Confidence']
    } for label in response['Labels']]
    
    # Generate a text description
    description = "This image contains: " + ", ".join([f"{label['name']} ({label['confidence']:.2f}%)" for label in labels_data])
    
    return {
        'labels': labels_data,
        'description': description,
        'count': len(response['Labels'])
    }

def process_image(image_data):
    """Process an uploaded image and return results"""
    try:
        # Upload to S3
        photo_key = upload_to_s3(image_data)
        
        # Detect labels
        results = detect_labels(photo_key)
        
        return {
            'success': True,
            'results': results
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }