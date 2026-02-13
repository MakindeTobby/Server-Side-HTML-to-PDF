import { useState } from "react";
import SignatureBox from "./components/SignatureBox";

export default function App() {
  const [name, setName] = useState("");
  const [ndisNumber, setNdisNumber] = useState("");
  const [signature, setSignature] = useState("");

  const submit = async () => {
    const res = await fetch("http://localhost:4000/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agreementNumber: "SA-2026-001",
        agreementDate: new Date().toDateString(),
        participant: {
          name,
          ndisNumber,
          address: "45 Residential Avenue, Melbourne VIC 3000",
          phone: "0412 345 678",
          email: "john.smith@email.com",
          signature,
        },
      }),
    });

    // const url = res.url;
    // window.location.href = url;
    const { id } = await res.json();

    window.location.href = `http://localhost:4000/api/pdf/${id}`;
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Service Agreement Demo</h2>

      <input
        placeholder="Client Name"
        onChange={(e) => setName(e.target.value)}
      />
      <br />

      <input
        placeholder="NDIS Number"
        onChange={(e) => setNdisNumber(e.target.value)}
      />
      <br />
      <br />

      <h4>Participant Signature</h4>
      <SignatureBox onChange={setSignature} />
      {signature && (
        <div style={{ marginTop: 10 }}>
          <strong>Signature captured:</strong>
          <br />
          <img src={signature} style={{ height: 60 }} />
        </div>
      )}
      <br />

      <button onClick={submit} disabled={!signature}>
        Generate PDF
      </button>
    </div>
  );
}
