(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'naimulislam.dev@gmail.com', password: 'N@imul06#' })
    });
    console.log('STATUS', res.status);
    const text = await res.text();
    console.log('BODY:', text);
  } catch (e) {
    console.error('ERROR:', e);
  }
})();
