// No need for node-fetch in Node 18+
async function testRegister() {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test" + Date.now() + "@example.com",
        password: "password123",
        college: "Test College"
      }),
    });
    const text = await res.text();
    console.log("Response text:", text);
    const data = JSON.parse(text);
    console.log("Response status:", res.status);
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error testing register:", err.message);
  }
}

testRegister();
