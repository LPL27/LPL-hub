import boto3
import json

# Initialize Bedrock Runtime client
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-west-2')

# Load broker data
with open('broker_data.json', 'r') as file:
    data = json.load(file)

# Define the prompt
prompt = "Based on the data of this broker from the data variable, write bullet point summary describing them to a potential client."

# Prepare the request payload
kwargs = {
    "modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0",
    "contentType": "application/json",
    "accept": "application/json",
    "body": json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 200,
        "top_k": 250,
        "stop_sequences": [],
        "temperature": 1,
        "top_p": 0.999,
        "messages": [
            {
                "role": "user",
                "content": prompt  # Changed from list to string
            }
        ]
    })
}

# Invoke the model
response = bedrock_runtime.invoke_model(**kwargs)

# Process the response
body = json.loads(response['body'].read().decode('utf-8'))  # Decode the body if it's a binary stream
print(body)
