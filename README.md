NotebookLM Clone

An AI-powered document question-answering application built using React and AWS services. Users can upload documents and ask questions to receive AI-generated answers based on the uploaded content.

Features

- Secure user authentication using Amazon Cognito.
- Upload PDF and TXT documents.
- Store documents in Amazon S3.
- Retrieve relevant information using Amazon Bedrock Knowledge Bases.
- Generate AI-powered answers using Amazon Bedrock.
- Display answers with source citations.
- React-based user interface.

Technologies Used

Frontend: React.js, Vite, CSS

AWS Services:

- Amazon S3
- Amazon Bedrock
- Amazon Bedrock Knowledge Bases
- AWS Lambda
- Amazon API Gateway
- Amazon Cognito
- Amazon CloudFront
- Amazon CloudWatch

Architecture

1. Users sign in through Amazon Cognito.
2. Documents are uploaded through the React application.
3. Amazon S3 stores uploaded documents.
4. Bedrock Knowledge Bases retrieves relevant document content.
5. AWS Lambda processes requests.
6. API Gateway connects the frontend to backend services.
7. Amazon Bedrock generates answers with citations.
8. CloudFront delivers the frontend application.

Live Application

https://d2wb6urtl13mx1.cloudfront.net

GitHub Repository

https://github.com/anikashreya11/notebooklm-clone

Project Status

Core application implemented and deployed using AWS services.

Author

Developed as an academic project.
