import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

export default function SignatureBox({ onChange }) {
  const sigRef = useRef(null);

  const save = () => {
    const canvas = sigRef.current;
    if (!canvas) return;

    const base64 = canvas.getCanvas().toDataURL("image/png");

    onChange(base64);
  };

  const clear = () => {
    sigRef.current.clear();
    onChange("");
  };

  return (
    <div>
      <SignatureCanvas
        ref={sigRef}
        penColor="black"
        canvasProps={{
          width: 300,
          height: 120,
          style: { border: "1px solid #ccc" },
        }}
      />

      <div style={{ marginTop: 10 }}>
        <button type="button" onClick={save}>
          Use signature
        </button>

        <button type="button" onClick={clear} style={{ marginLeft: 10 }}>
          Clear
        </button>
      </div>
    </div>
  );
}
