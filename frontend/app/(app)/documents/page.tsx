"use client";

import { useEffect, useState } from "react";

type Document = {
  id: string;
  file_name: string;
  status: string;
  chunk_count: number;
  embedding_count: number;
  error_message: string;
  uploaded_at: string;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    try {
      // Fetch data from API. Note: Since we are not using auth in this simple UI for now,
      // you might need to adjust headers if your API requires strict auth tokens.
      const res = await fetch("http://localhost:8080/api/documents", {
        headers: {
          // Replace with your actual auth token if required by backend middleware
          Authorization: "UkaSa4zbc4IHpxyjgcOlHh7edfxMN24O",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll every 5 seconds
  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("course_id", "00000000-0000-0000-0000-000000000001");

    try {
      const res = await fetch("http://localhost:8080/api/documents/upload", {
        method: "POST",
        headers: {
          Authorization: "UkaSa4zbc4IHpxyjgcOlHh7edfxMN24O",
        },
        body: formData,
      });
      
      if (res.ok) {
        setSelectedFile(null);
        // Reset file input value
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchDocuments(); // Refresh list immediately
      } else {
        alert("Upload failed. Check console for details.");
      }
    } catch (err) {
      console.error("Failed to upload:", err);
      alert("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>Document Indexing Monitor</h1>
      
      <div style={{ margin: "20px 0", padding: "20px", border: "1px dashed #ccc", borderRadius: "8px", backgroundColor: "#fafafa" }}>
        <h3 style={{ margin: "0 0 10px 0" }}>Upload New PDF</h3>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input 
            id="file-upload"
            type="file" 
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ padding: "8px" }}
          />
          <button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading}
            style={{
              padding: "8px 16px",
              backgroundColor: !selectedFile || uploading ? "#ccc" : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: !selectedFile || uploading ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </div>
      
      {loading && documents.length === 0 ? (
        <p>Loading documents...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
              <th style={thStyle}>File Name</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Chunks</th>
              <th style={thStyle}>Embeddings</th>
              <th style={thStyle}>Uploaded At</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={tdStyle}>
                  <strong>{doc.file_name}</strong>
                  {doc.error_message && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                      Error: {doc.error_message}
                    </div>
                  )}
                </td>
                <td style={tdStyle}>
                  <span style={getStatusStyle(doc.status)}>
                    {doc.status.toUpperCase()}
                  </span>
                </td>
                <td style={tdStyle}>{doc.chunk_count}</td>
                <td style={tdStyle}>{doc.embedding_count}</td>
                <td style={tdStyle}>{new Date(doc.uploaded_at).toLocaleString()}</td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "20px", textAlign: "center" }}>
                  No documents found. Upload a PDF file above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  padding: "12px",
  borderBottom: "2px solid #ddd",
};

const tdStyle = {
  padding: "12px",
};

function getStatusStyle(status: string) {
  const baseStyle = {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold" as const,
  };

  switch (status) {
    case "uploading":
      return { ...baseStyle, backgroundColor: "#fff3cd", color: "#856404" };
    case "indexing":
      return { ...baseStyle, backgroundColor: "#cce5ff", color: "#004085" };
    case "indexed":
      return { ...baseStyle, backgroundColor: "#d4edda", color: "#155724" };
    case "error":
      return { ...baseStyle, backgroundColor: "#f8d7da", color: "#721c24" };
    default:
      return { ...baseStyle, backgroundColor: "#e2e3e5", color: "#383d41" };
  }
}
