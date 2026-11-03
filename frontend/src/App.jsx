
import { useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

const API_URL =
  "https://c1qlq5a567.execute-api.ap-southeast-2.amazonaws.com/chat";

const UPLOAD_API_URL =
  "https://c1qlq5a567.execute-api.ap-southeast-2.amazonaws.com/upload";

// Get the Cognito access token.
async function getAuthHeaders() {
const session = await fetchAuthSession();
const token = session.tokens?.idToken?.toString();


  if (!token) {
    throw new Error("Session expired. Please sign in again.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Safely read API responses.
async function readResponse(response) {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      `API request failed (${response.status})`
    );
  }

  return data;
}

function App() {
  const [documents, setDocuments] = useState([]);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length || uploading) return;

    setUploading(true);

    try {
      for (const file of files) {
        try {
          const extension = file.name.split(".").pop().toLowerCase();

          if (!["txt", "pdf"].includes(extension)) {
            throw new Error("Only TXT and PDF files are supported.");
          }

          // Convert file to Base64
const fileContent = await new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => {
    resolve(String(reader.result).split(",")[1]);
  };

  reader.onerror = () => reject(reader.error);

  reader.readAsDataURL(file);
});
          const headers = await getAuthHeaders();

          const response = await fetch(UPLOAD_API_URL, {
            method: "POST",
            headers,
           body: JSON.stringify({
  fileName: file.name,
  fileContent,
  contentType: file.type || (
    file.name.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : "text/plain"
  ),
}),
          });

          const data = await readResponse(response);

          setDocuments((previous) => [
            ...previous,
            {
              name: file.name,
              key: data.key || file.name,
            },
          ]);

          alert(`${file.name} uploaded successfully!`);
        } catch (error) {
          alert(`Failed to upload ${file.name}: ${error.message}`);
        }
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleAsk(event) {
    event.preventDefault();

    const userQuestion = question.trim();

    if (!userQuestion || loading) return;

    const messageId = `${Date.now()}-${Math.random()}`;

    setQuestion("");
    setLoading(true);

    setMessages((previous) => [
      ...previous,
      {
        id: messageId,
        question: userQuestion,
        answer: "Thinking...",
        citations: [],
      },
    ]);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          question: userQuestion,
        }),
      });

      const data = await readResponse(response);

      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId
            ? {
                ...message,
                answer: data.answer || "No answer was returned.",
                citations: Array.isArray(data.citations)
                  ? data.citations
                  : [],
              }
            : message
        )
      );
    } catch (error) {
      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId
            ? {
                ...message,
                answer: `Error: ${error.message}`,
              }
            : message
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">N</span>
          <span>NotebookLM</span>
        </div>

        <span className="status">
          Document AI Workspace
        </span>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <h2>Sources</h2>

          <p className="muted">
            Add documents to your notebook.
          </p>

          <label className="upload-button">
            {uploading ? "Uploading..." : "+ Upload documents"}

            <input
              type="file"
              accept=".txt,.pdf"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              hidden
            />
          </label>

          <div className="document-list">
            {documents.map((file, index) => (
              <div
                className="document"
                key={`${file.name}-${index}`}
              >
                <span>📄</span>
                <span className="document-name">
                  {file.name}
                </span>
              </div>
            ))}

            {documents.length === 0 && (
              <p className="empty">
                No documents added yet.
              </p>
            )}
          </div>
        </aside>

        <section className="chat-panel">
          <div className="welcome">
            <div className="welcome-icon">✦</div>

            <h1>Your documents, understood.</h1>

            <p>
              Ask questions about your documents and explore
              their key ideas.
            </p>
          </div>

          <div className="messages">
            {messages.map((message) => (
              <div
                className="message-group"
                key={message.id}
              >
                <div className="question-bubble">
                  {message.question}
                </div>

                <div className="answer">
                  <strong>NotebookLM</strong>

                  <p className="answer-text">
                    {message.answer}
                  </p>

                  {message.citations.length > 0 && (
                    <div className="citations">
                      <strong>Sources</strong>

                      {message.citations.map((citation, index) => {
                        const location = citation.location || {};

                        const uri =
                          location.s3Location?.uri ||
                          location.webLocation?.url ||
                          "";

                        return (
                          <div
                            className="citation"
                            key={`${message.id}-source-${index}`}
                          >
                            <strong>
                              Source {citation.source ?? index + 1}
                            </strong>

                            {uri && (
                              <p className="citation-location">
                                {uri}
                              </p>
                            )}

                            <p>
                              {citation.text ||
                                "No passage text returned."}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form
            className="question-form"
            onSubmit={handleAsk}
          >
            <input
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="Ask a question about your documents..."
              aria-label="Your question"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
            >
              {loading ? "Thinking..." : "Ask"}
            </button>
          </form>

          <p className="footer-note">
            Answers are generated by your AWS backend.
          </p>
        </section>
      </main>
    </div>
  );
}

export default withAuthenticator(App);
