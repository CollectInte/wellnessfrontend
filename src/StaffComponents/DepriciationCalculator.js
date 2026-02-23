import React, { useState } from "react";

export default function DepreciationCalculator() {
  const [assetValue, setAssetValue] = useState(0);
  const [rate, setRate] = useState(15);
  const [halfYear, setHalfYear] = useState(false);

  const depreciation =
    assetValue *
    (rate / 100) *
    (halfYear ? 0.5 : 1);

  const closingWDV = assetValue - depreciation;

  const cardStyle = {
    maxWidth: 500,
    margin: "30px auto",
    padding: 20,
    borderRadius: 12,
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    fontFamily: "Inter, sans-serif",
  };

  const inputStyle = {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
  };

  return (
    <div style={cardStyle}>
      <h3>📉 Depreciation Calculator (WDV)</h3>

      <label>Asset Value (Opening WDV)</label>
      <input
        style={inputStyle}
        type="number"
        placeholder="e.g. 500000"
        onChange={(e) =>
          setAssetValue(Number(e.target.value))
        }
      />

      <label>Depreciation Rate (%)</label>
      <select
        style={inputStyle}
        value={rate}
        onChange={(e) =>
          setRate(Number(e.target.value))
        }
      >
        <option value={5}>5%</option>
        <option value={10}>10%</option>
        <option value={15}>15%</option>
        <option value={30}>30%</option>
        <option value={40}>40%</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={halfYear}
          onChange={() => setHalfYear(!halfYear)}
        />{" "}
        Used for less than 180 days (Half-year rule)
      </label>

      <hr />

      <p>
        <b>Depreciation Amount:</b>{" "}
        ₹{depreciation.toFixed(2)}
      </p>
      <p>
        <b>Closing WDV:</b>{" "}
        ₹{closingWDV.toFixed(2)}
      </p>

      <p style={{ fontSize: 12, color: "#666" }}>
        Method: Written Down Value (WDV) as per
        Income-tax Act.
      </p>
    </div>
  );
}
