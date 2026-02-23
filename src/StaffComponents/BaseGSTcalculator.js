import React, { useState } from "react";

export default function BaseGSTCalculator() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [gstRate, setGstRate] = useState(18);

  const baseAmount =
    totalAmount / (1 + gstRate / 100);

  const gstAmount =
    totalAmount - baseAmount;

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  };

  const cardStyle = {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    maxWidth: "500px",
    margin: "30px auto",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ marginBottom: 20 }}>
        🔄 GST Base Amount Calculator
      </h3>

      <label>Total Amount (Including GST)</label>
      <input
        style={inputStyle}
        type="number"
        placeholder="e.g. 2000"
        onChange={(e) =>
          setTotalAmount(Number(e.target.value))
        }
      />

      <label>GST Percentage</label>
      <select
        style={inputStyle}
        value={gstRate}
        onChange={(e) =>
          setGstRate(Number(e.target.value))
        }
      >
        <option value={0}>0%</option>
        <option value={5}>5%</option>
        <option value={12}>12%</option>
        <option value={18}>18%</option>
        <option value={28}>28%</option>
        <option value={36}>36%</option>
      </select>

      <hr />

      <p>
        <b>Base Amount (Before GST):</b>{" "}
        ₹{baseAmount.toFixed(2)}
      </p>
      <p>
        <b>GST Amount:</b> ₹{gstAmount.toFixed(2)}
      </p>

      <p style={{ fontSize: 12, color: "#666" }}>
        Formula Used:
        <br />
        Base Amount = Total Amount ÷ (1 + GST / 100)
      </p>
    </div>
  );
}
