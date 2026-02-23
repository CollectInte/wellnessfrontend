import React, { useState } from "react";
import "./BookDemo.css";
import demo from '../images/demo.png';

const BookDemo = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Basic validation
  if (!form.name || !form.email || !form.mobile) {
    alert("Please fill all required fields");
    return;
  }

  // Mobile validation
  if (!/^\d{10}$/.test(form.mobile)) {
    alert("Enter valid 10-digit mobile number");
    return;
  }

  try {
    const response = await fetch(`${process.env.REACT_APP_URL}/demo/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Submission failed");
    }

    alert("Demo request submitted successfully!");

    // Reset form
    setForm({
      name: "",
      email: "",
      mobile: "",
      message: "",
    });
  } catch (error) {
    console.error(error);
    alert(error.message || "Something went wrong");
  }
};


  return (
    <div className="demo-container">
      {/* LEFT SECTION */}
      <div className="demo-left">
        <h1>Book a Demo</h1>
        <p className="subtitle">What you will see in the demo</p>

        <ul className="checklist">
          <li>✔ A live demo with our product specialist</li>
          <li>✔ How you can create tasks, reminders, billing, and more</li>
          <li>✔ Real use cases and practical examples for CA firms</li>
        </ul>

        <div className="demo-image">
          <img
            src={demo}
            alt="Dashboard Preview"
          />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="demo-right">
        <form onSubmit={handleSubmit}>
          <label>
            Your Name *
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label>
            Email Address *
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Mobile Number *
            <div className="mobile-input">
              <input
                type="text"
                name="mobile"
                placeholder="Enter 10 digit mobile number"
                value={form.mobile}
                onChange={handleChange}
              />
              <span className="flag">🇮🇳</span>
            </div>
          </label>

          <label>
            Message
            <textarea
              name="message"
              placeholder="Enter your message..."
              maxLength="180"
              value={form.message}
              onChange={handleChange}
            />
            <small>{form.message.length}/180</small>
          </label>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default BookDemo;
