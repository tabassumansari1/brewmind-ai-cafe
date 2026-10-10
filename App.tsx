import { useState } from 'react'

export default function App() {
  const [page, setPage] = useState('home')
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#8B4513' }}>☕ BrewMind AI Cafe</h1>
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setPage('home')} style={{ padding: '8px 16px', background: '#8B4513', color: 'white', border: 'none', borderRadius: '5px' }}>Home</button>
        <button onClick={() => setPage('menu')} style={{ padding: '8px 16px', background: '#D2691E', color: 'white', border: 'none', borderRadius: '5px' }}>Menu</button>
        <button onClick={() => setPage('owner')} style={{ padding: '8px 16px', background: '#A0522D', color: 'white', border: 'none', borderRadius: '5px' }}>Owner</button>
      </nav>
      {page === 'home' && <div><h2>Welcome!</h2><p>AI Cafe Management</p><p style={{ color: 'green', fontWeight: 'bold' }}>✅ Build Fixed!</p></div>}
      {page === 'menu' && <div><div style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '5px' }}>Espresso - $3.50</div><div style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '5px' }}>Latte - $4.50</div></div>}
      {page === 'owner' && <div style={{ border: '1px solid #ccc', padding: '15px' }}><h3>Owner Dashboard</h3><p>Orders: 24 | Revenue: $342</p></div>}
    </div>
  )
}
