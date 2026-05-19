(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin', email: 'admin@lifeos.ai', password: 'password123' })
    });
    const data = await res.json();
    console.log("REGISTER RESPONSE:", data);
  } catch (err) {
    console.error(err);
  }
})();
