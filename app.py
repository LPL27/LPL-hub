import boto3
import json


bedrock_runtime = boto3.client('bedrock_runtime', region_name='us-west-02')

with open('client_data.json', 'r') as file:
    data = json.load(file)

prompt = "Based on the data of this client from the data variable, write bullet point summary describing them to a financial broker."

kwargs = {
{
  "modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "contentType": "application/json",
  "accept": "application/json",
  "body": json.dumps ({
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 200,
    "top_k": 250,
    "stop_sequences": [],
    "temperature": 1,
    "top_p": 0.999,
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": prompt
          }
        ]
      }
    ]
  })
}
}


response = bedrock_runtime.invoke_model(**kwargs)

body = json.loads(response['body'].read())
print(body)