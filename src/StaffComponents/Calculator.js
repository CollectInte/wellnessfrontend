import React, { useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";

export default function TaxCalculatorsPage() {
  /* ---------------- SELECT CALCULATOR ---------------- */
  const [calculatorType, setCalculatorType] = useState("GST");

  /* ---------------- MODAL STATE ---------------- */
  const [open, setOpen] = useState(false);

  /* ---------------- GST ---------------- */
  const [gst, setGst] = useState({ sales: "", rate: 18, itc: "" });
  const [gstResult, setGstResult] = useState(null);

  /* ---------------- ITR ---------------- */
  const [itr, setItr] = useState({
    income: "",
    deduction: "",
    tds: "",
    slab: 0.05,
  });
  const [itrResult, setItrResult] = useState(null);

  /* ---------------- GST CALC ---------------- */
  const calculateGST = () => {
    const sales = Number(gst.sales || 0);
    const rate = Number(gst.rate || 0);
    const itc = Number(gst.itc || 0);

    const outputGST = (sales * rate) / 100;
    const netGST = outputGST - itc;

    setGstResult({
      outputGST,
      netGST,
      status: netGST > 0 ? "Payable" : netGST < 0 ? "Excess ITC" : "Nil",
    });
  };

  /* ---------------- ITR CALC ---------------- */
  const calculateITR = () => {
    const income = Number(itr.income || 0);
    const deduction = Number(itr.deduction || 0);
    const tds = Number(itr.tds || 0);

    const taxableIncome = income - deduction;
    const incomeTax = taxableIncome * itr.slab;
    const cess = incomeTax * 0.04;
    const totalTax = incomeTax + cess;
    const net = totalTax - tds;

    setItrResult({
      taxableIncome,
      totalTax,
      net,
      status: net > 0 ? "Tax Payable" : "Refund",
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
        Tax Calculators
      </Typography>

      {/* ---------------- SELECT DROPDOWN ---------------- */}
      <TextField
        select
        label="Select Calculator"
        fullWidth
        value={calculatorType}
        onChange={(e) => setCalculatorType(e.target.value)}
        sx={{ mb: 3 }}
      >
        <MenuItem value="GST">GST Liability Calculator</MenuItem>
        <MenuItem value="ITR">Income Tax (ITR) Calculator</MenuItem>
      </TextField>

      <Button
        variant="contained"
        fullWidth
        onClick={() => setOpen(true)}
      >
        Open Calculator
      </Button>

      {/* ================= CALCULATOR MODAL ================= */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {calculatorType === "GST" ? "GST Liability Calculator" : "Income Tax Calculator"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {calculatorType === "GST" ? (
              <>
                <TextField
                  label="Total Sales Value"
                  fullWidth
                  onChange={(e) => setGst({ ...gst, sales: e.target.value })}
                />
                <TextField
                  select
                  label="GST Rate"
                  value={gst.rate}
                  onChange={(e) => setGst({ ...gst, rate: e.target.value })}
                >
                  {[5, 12, 18, 28].map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}%
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Eligible ITC"
                  fullWidth
                  onChange={(e) => setGst({ ...gst, itc: e.target.value })}
                />

                <Button variant="contained" onClick={calculateGST}>
                  Calculate
                </Button>

                {gstResult && (
                  <Box>
                    <Typography>Output GST: ₹{gstResult.outputGST}</Typography>
                    <Typography>
                      {gstResult.status}: ₹{Math.abs(gstResult.netGST)}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <>
                <TextField
                  label="Annual Income"
                  fullWidth
                  onChange={(e) => setItr({ ...itr, income: e.target.value })}
                />
                <TextField
                  label="Deductions"
                  fullWidth
                  onChange={(e) => setItr({ ...itr, deduction: e.target.value })}
                />
                <TextField
                  select
                  label="Tax Slab"
                  value={itr.slab}
                  onChange={(e) => setItr({ ...itr, slab: e.target.value })}
                >
                  <MenuItem value={0}>Up to 2.5L (0%)</MenuItem>
                  <MenuItem value={0.05}>2.5L – 5L (5%)</MenuItem>
                  <MenuItem value={0.2}>5L – 10L (20%)</MenuItem>
                  <MenuItem value={0.3}>Above 10L (30%)</MenuItem>
                </TextField>
                <TextField
                  label="TDS Paid"
                  fullWidth
                  onChange={(e) => setItr({ ...itr, tds: e.target.value })}
                />

                <Button variant="contained" onClick={calculateITR}>
                  Calculate
                </Button>

                {itrResult && (
                  <Box>
                    <Typography>Taxable Income: ₹{itrResult.taxableIncome}</Typography>
                    <Typography>Total Tax (incl. cess): ₹{itrResult.totalTax}</Typography>
                    <Typography>
                      {itrResult.status}: ₹{Math.abs(itrResult.net)}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
