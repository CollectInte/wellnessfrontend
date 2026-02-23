import React, { useState } from "react";

export default function TaxCalculatorsPage() {
  const [pan, setPan] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState(30);
  const [category, setCategory] = useState("Individual");
  const [grossIncome, setGrossIncome] = useState(0);
  const [ded80C, setDed80C] = useState(0);
  const [ded80D, setDed80D] = useState(0);
  const [hraExemption, setHraExemption] = useState(0);

  const capped80C = Math.min(ded80C, 150000);
  const capped80D = Math.min(ded80D, age >= 60 ? 50000 : 25000);

  const totalOldDeductions =
    capped80C + capped80D + Number(hraExemption);

  const taxableOld = Math.max(0, grossIncome - totalOldDeductions);
  const taxableNew = grossIncome;

  const getBasicExemption = () => {
    if (age >= 80) return 500000;
    if (age >= 60) return 300000;
    return 250000;
  };

  const calculateOldTax = (income) => {
    const exemption = getBasicExemption();
    if (income <= exemption) return 0;
    if (income <= 500000) return (income - exemption) * 0.05;
    if (income <= 1000000)
      return (
        (500000 - exemption) * 0.05 +
        (income - 500000) * 0.2
      );
    return (
      (500000 - exemption) * 0.05 +
      500000 * 0.2 +
      (income - 1000000) * 0.3
    );
  };

  const calculateNewTax = (income) => {
    if (income <= 300000) return 0;
    if (income <= 600000) return (income - 300000) * 0.05;
    if (income <= 900000)
      return 15000 + (income - 600000) * 0.1;
    if (income <= 1200000)
      return 45000 + (income - 900000) * 0.15;
    if (income <= 1500000)
      return 90000 + (income - 1200000) * 0.2;
    return 150000 + (income - 1500000) * 0.3;
  };

  const calculateBusinessTax = (income) => {
    if (category === "LLP") return income * 0.3;
    if (category === "Domestic Company") return income * 0.3;
    if (category === "No opt 115BAD") return income * 0.242;
    if (category === "with opt 115BAD") return income * 0.251;
    if (category === "with opt 115BAE") return income * 0.171;
    if (category === "Trust") return income * 0.427;
    return 0;
  };

  let taxOld = 0;
  let taxNew = 0;

  if (category === "Individual") {
    taxOld = calculateOldTax(taxableOld);
    taxNew = calculateNewTax(taxableNew);
  } else {
    taxOld = calculateBusinessTax(grossIncome);
    taxNew = taxOld;
  }

  const finalOld = taxOld + taxOld * 0.04;
  const finalNew = taxNew + taxNew * 0.04;

  const comparison =
    finalOld > finalNew
      ? `✅ You save ₹${(finalOld - finalNew).toFixed(
          0
        )} by opting New Regime`
      : finalOld < finalNew
      ? `✅ You save ₹${(finalNew - finalOld).toFixed(
          0
        )} by opting Old Regime`
      : "ℹ️ No tax difference between regimes";

  const card = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginBottom: 20,
  };

  const input = {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "30px auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>
        Income Tax Calculator (Estimated)
      </h2>

      <div style={card}>
        <h3>👤 Taxpayer Details</h3>
        <input style={input} placeholder="PAN" onChange={(e) => setPan(e.target.value)} />
        <input style={input} placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input style={input} type="number" placeholder="Age" onChange={(e) => setAge(+e.target.value)} />
        <select style={input} onChange={(e) => setCategory(e.target.value)}>
          <option>Individual</option>
          <option>LLP</option>
          <option>Domestic Company</option>
          <option>No opt 115BAD</option>
          <option>with opt 115BAD</option>
          <option>with opt 115BAE</option>
          <option>Trust</option>
        </select>
      </div>

      <div style={card}>
        <h3>💰 Income</h3>
        <input
          style={input}
          type="number"
          placeholder="Gross Total Income"
          onChange={(e) => setGrossIncome(+e.target.value)}
        />
      </div>

      {category === "Individual" && (
        <div style={card}>
          <h3>📉 Old Regime Deductions</h3>
          <input style={input} placeholder="80C (Max ₹1,50,000)" onChange={(e) => setDed80C(+e.target.value)} />
          <input style={input} placeholder="80D (Health Insurance)" onChange={(e) => setDed80D(+e.target.value)} />
          <input style={input} placeholder="HRA Exemption" onChange={(e) => setHraExemption(+e.target.value)} />
        </div>
      )}

      <div style={{ ...card, background: "#f8fafc" }}>
        <h3>📊 Tax Summary</h3>
        <table width="100%" cellPadding="10">
          <tbody>
            <tr>
              <td>Taxable Income (Old)</td>
              <td align="right">₹{taxableOld}</td>
            </tr>
            <tr>
              <td>Taxable Income (New)</td>
              <td align="right">₹{taxableNew}</td>
            </tr>
            <tr>
              <td><b>Tax (Old Regime)</b></td>
              <td align="right"><b>₹{finalOld.toFixed(0)}</b></td>
            </tr>
            <tr>
              <td><b>Tax (New Regime)</b></td>
              <td align="right"><b>₹{finalNew.toFixed(0)}</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 10,
          background: "#e6f4ea",
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        {comparison}
      </div>

      <p style={{ fontSize: 12, color: "#666", marginTop: 20 }}>
        Disclaimer: This calculator is indicative. Final tax
        liability depends on applicable provisions of the Income
        Tax Act.
      </p>
    </div>
  );
}
