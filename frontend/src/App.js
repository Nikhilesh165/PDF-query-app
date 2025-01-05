import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

function App() {
    // State variables for managing file uploads, PDF list, selected PDF, user questions, and chat messages
    const [file, setFile] = useState(null);
    const [pdfs, setPdfs] = useState([]);
    const [showPdfs, setShowPdfs] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState("");
    const [question, setQuestion] = useState("");
    const [chat, setChat] = useState([]);

    // Fetch the list of PDFs when the component mounts
    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const response = await axios.get("http://localhost:8000/list-pdfs/");
                setPdfs(response.data.pdfs); // Update state with the fetched PDFs
            } catch (error) {
                console.error("Error fetching PDFs:", error); // Log any errors
            }
        };
        fetchPdfs();
    }, []);

    // Handle file upload when a user selects a file
    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files[0]; 
        setFile(selectedFile); 
        const formData = new FormData();
        formData.append("file", selectedFile); 

        try {
            const response = await axios.post("http://localhost:8000/upload/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setChat((prevChat) => [...prevChat, { type: "system", message: response.data.message }]); 
            setPdfs((prevPdfs) => [...prevPdfs, { id: pdfs.length + 1, filename: selectedFile.name }]); 
            setSelectedPdf(selectedFile.name); 
        } catch (error) {
            console.error("Error uploading file:", error); 
            setChat((prevChat) => [...prevChat, { type: "error", message: "File upload failed" }]); 
        }
    };

    // Toggle the display of the PDFs list
    const togglePdfsDisplay = () => {
        setShowPdfs((prevShowPdfs) => !prevShowPdfs); 
    };

    // Handle PDF deletion
    const handleDeletePdf = async (pdfId) => {
        try {
            await axios.delete(`http://localhost:8000/delete-pdf/${pdfId}/`); 
            setPdfs((prevPdfs) => prevPdfs.filter((pdf) => pdf.id !== pdfId));
            setChat((prevChat) => [...prevChat, { type: "system", message: "PDF deleted successfully" }]);

            // Clear the selected PDF if it was deleted
            if (selectedPdf && pdfs.find((pdf) => pdf.id === pdfId)?.filename === selectedPdf) {
                setSelectedPdf("");
            }
        } catch (error) {
            console.error("Error deleting PDF:", error); 
            setChat((prevChat) => [...prevChat, { type: "error", message: "Failed to delete PDF" }]);
        }
    };

    // Handle question submission related to the selected PDF
    const handleQuestionSubmit = async () => {
        if (!selectedPdf) {
            setChat((prevChat) => [...prevChat, { type: "error", message: "Please select a PDF first" }]);
            return;
        }

        if (!question.trim()) {
            setChat((prevChat) => [...prevChat, { type: "error", message: "Please enter a question" }]);
            return;
        }

        setChat((prevChat) => [...prevChat, { type: "user", message: question }]);

        try {
            const response = await axios.post("http://localhost:8000/query/", {
                filename: selectedPdf,
                question: question,
            });
            setChat((prevChat) => [...prevChat, { type: "ai", message: response.data.answer }]);
            setQuestion(""); 
        } catch (error) {
            console.error("Error querying the PDF:", error); 
            setChat((prevChat) => [...prevChat, { type: "error", message: "Failed to retrieve answer" }]);
        }
    };

    return (
        <div className="app">
            <header className="header">
                <div className="logo">
                    <img src="/AI Planet Logo.png" alt="AI Planet Logo" />
                </div>
                <div className="header-actions">
                    <label htmlFor="file-upload" className="custom-file-upload">
                        {selectedPdf ? `Selected: ${selectedPdf}` : "Upload PDF"} // Display selected PDF or prompt to upload
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload} // Handle file selection
                        style={{ display: "none" }}
                    />
                    <button className="view-pdfs-button" onClick={togglePdfsDisplay}>
                        {showPdfs ? "Hide Stored PDFs" : "View Stored PDFs"} // Toggle button text based on state
                    </button>
                </div>
            </header>

            {showPdfs && (
                <div className="pdf-list">
                    <h2>Stored PDFs:</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Filename</th>
                                <th></th> {/* For delete button */}
                            </tr>
                        </thead>
                        <tbody>
                            {pdfs.map((pdf) => (
                                <tr key={pdf.id}>
                                    <td
                                        onClick={() => setSelectedPdf(pdf.filename)} // Set selected PDF on click
                                        style={{ cursor: "pointer" }}
                                    >
                                        {pdf.filename}
                                    </td>
                                    <td>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeletePdf(pdf.id)} // Handle PDF deletion
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="chat-container">
                <div className="chat-box">
                    {chat.map((message, index) => (
                        <div key={index} className={`chat-message ${message.type}`}>
                            <div className="message-icon">
                                <img
                                    src={message.type === "user" ? "/user-sign-icon-person-symbol-human-avatar-isolated-on-white-backogrund-vector.jpg" : "/da66b589899da7047ac6fe05c0f1371f.png"}
                                    alt={message.type}
                                />
                            </div>
                            <div className="message-content">{message.message}</div>
                        </div>
                    ))}
                </div>
                <div className="input-section">
                    <input
                        type="text"
                        value={question}
                        placeholder="Type your question here..." // Placeholder for user input
                        onChange={(e) => setQuestion(e.target.value)} // Update question state on input change
                    />
                    <button onClick={handleQuestionSubmit}>Send</button> // Submit question
                </div>
            </div>
        </div>
    );
}

export default App;

