import { useState, useEffect } from 'react'

type Item = { id: number; name: string; price: number; cat: string; emoji: string; desc: string }
type Order = { id: string; items: Item[]; total: number; status: 'preparing'|'ready'|'done'; time: string }

const MENU: Item[] = [
  { id: 1, name: 'Espresso', price: 3.5, cat: 'Coffee', emoji: '☕', desc: 'Strong & bold shot' },
  { id: 2, name: 'Cappuccino', price: 4.5, cat: 'Coffee', emoji: '🤎', desc: 'Foamy milk delight' },
  { id: 3, name: 'Caramel Latte', price: 5.0, cat: 'Coffee', emoji: '🥤', desc: 'Sweet caramel swirl' },
  { id: 4, name: 'Mocha', price: 5.5, cat: 'Coffee', emoji: '🍫', desc: 'Chocolate coffee blend' },
  { id: 5, name: 'Croissant', price: 2.5, cat: 'Bakery', emoji: '🥐', desc: 'Buttery French fresh' },
  { id: 6, name: 'Muffin', price: 3.0, cat: 'Bakery', emoji: '🧁', desc: 'Blueberry juicy' },
]

export default function App(){
  const [tab,setTab]=useState<'home'|'menu'|'kitchen'|'owner'>('home')
  const [cart,setCart]=useState<Item[]>([])
  const [orders,setOrders]=useState<Order[]>([])
  const [filter,setFilter]=useState('All')

  useEffect(()=>{ const s=localStorage.getItem('brew_orders'); if(s) setOrders(JSON.parse(s)) },[])
  useEffect(()=>{ localStorage.setItem('brew_orders', JSON.stringify(orders)) },[orders])

  const total = cart.reduce((a,b)=>a+b.price,0)
  const placeOrder=()=>{
    if(!cart.length) return
    const o:Order={ id:'ORD'+Math.floor(1000+Math.random()*9000), items:cart, total, status:'preparing', time:new Date().toLocaleTimeString() }
    setOrders([o,...orders]); setCart([]); setTab('kitchen')
  }

  const revenue = orders.reduce((a,b)=>a+b.total,0)

  return(
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#FFF7ED,#FFEDD5)', fontFamily:'system-ui', color:'#431407' }}>
      <header style={{ background:'white', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #FED7AA', position:'sticky', top:0, zIndex:9 }}>
        <b style={{ fontSize:'20px' }}>☕ BrewMind AI</b>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={()=>setTab('home')} style={{ padding:'8px 14px', borderRadius:20, border:'none', background:tab==='home'?'#9A3412':'#FFF7ED', color:tab==='home'?'white':'#9A3412', fontWeight:700, cursor:'pointer' }}>Home</button>
          <button onClick={()=>setTab('menu')} style={{ padding:'8px 14px', borderRadius:20, border:'none', background:tab==='menu'?'#9A3412':'#FFF7ED', color:tab==='menu'?'white':'#9A3412', fontWeight:700, cursor:'pointer' }}>Menu ({cart.length})</button>
          <button onClick={()=>setTab('kitchen')} style={{ padding:'8px 14px', borderRadius:20, border:'none', background:tab==='kitchen'?'#9A3412':'#FFF7ED', color:tab==='kitchen'?'white':'#9A3412', fontWeight:700, cursor:'pointer' }}>Kitchen ({orders.filter(o=>o.status!=='done').length})</button>
          <button onClick={()=>setTab('owner')} style={{ padding:'8px 14px', borderRadius:20, border:'none', background:tab==='owner'?'#9A3412':'#FFF7ED', color:tab==='owner'?'white':'#9A3412', fontWeight:700, cursor:'pointer' }}>Owner</button>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:'0 auto', padding:20 }}>
        {tab==='home' && (
          <div style={{ textAlign:'center', padding:'30px 10px' }}>
            <div style={{ fontSize:70 }}>☕</div>
            <h1 style={{ fontSize:44, margin:'10px 0' }}>BrewMind AI Cafe</h1>
            <p style={{ maxWidth:600, margin:'0 auto 20px', fontSize:18, color:'#7C2D12' }}>AI-powered cafe — Order in 1-click, track kitchen live, and view revenue instantly. No white screen!</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginTop:30 }}>
              <div style={{ background:'white', padding:20, borderRadius:16, boxShadow:'0 4px 10px rgba(0,0,0,0.05)' }}><h3>⚡ Fast Order</h3><p>Add to cart instantly</p></div>
              <div style={{ background:'white', padding:20, borderRadius:16, boxShadow:'0 4px 10px rgba(0,0,0,0.05)' }}><h3>👨‍🍳 Live Kitchen</h3><p>Preparing → Ready → Done</p></div>
              <div style={{ background:'white', padding:20, borderRadius:16, boxShadow:'0 4px 10px rgba(0,0,0,0.05)' }}><h3>📊 Owner Stats</h3><p>Revenue & orders</p></div>
            </div>
            <button onClick={()=>setTab('menu')} style={{ marginTop:28, padding:'14px 32px', background:'#9A3412', color:'white', border:'none', borderRadius:30, fontSize:18, fontWeight:800, cursor:'pointer' }}>Start Ordering →</button>
            <p style={{ color:'green', fontWeight:700, marginTop:18 }}>✅ Vercel Build Fixed — Ready for Emergent</p>
          </div>
        )}

        {tab==='menu' && (
          <div>
            <div style={{ display:'flex', gap:10, marginBottom:20 }}>
              {['All','Coffee','Bakery'].map(c=> <button key={c} onClick={()=>setFilter(c)} style={{ padding:'8px 16px', borderRadius:20, border:'1px solid #FDBA74', background:filter===c?'#9A3412':'white', color:filter===c?'white':'#9A3412', cursor:'pointer' }}>{c}</button>)}
              <div style={{ marginLeft:'auto', background:'white', padding:'8px 16px', borderRadius:20, fontWeight:800 }}>Cart ${total.toFixed(2)}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:14 }}>
              {MENU.filter(m=> filter==='All'||m.cat===filter).map(m=>(
                <div key={m.id} style={{ background:'white', padding:16, borderRadius:16, display:'flex', justifyContent:'space-between', boxShadow:'0 4px 10px rgba(0,0,0,0.05)' }}>
                  <div><div style={{ fontSize:28 }}>{m.emoji}</div><b>{m.name}</b><p style={{ margin:'2px 0', color:'#888', fontSize:12 }}>{m.desc}</p><p style={{ fontWeight:800 }}>${m.price}</p></div>
                  <button onClick={()=>setCart([...cart,m])} style={{ alignSelf:'center', background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:10, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}>+ Add</button>
                </div>
              ))}
            </div>
            {cart.length>0 && (
              <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', background:'#431407', color:'white', padding:'12px 18px', borderRadius:30, display:'flex', gap:12, alignItems:'center' }}>
                <span>{cart.length} items • ${total.toFixed(2)}</span>
                <button onClick={placeOrder} style={{ background:'white', color:'#431407', border:'none', padding:'8px 16px', borderRadius:20, fontWeight:800, cursor:'pointer' }}>Place Order</button>
                <button onClick={()=>setCart([])} style={{ background:'transparent', color:'white', border:'1px solid white', padding:'6px 12px', borderRadius:20, cursor:'pointer' }}>Clear</button>
              </div>
            )}
          </div>
        )}

        {tab==='kitchen' && (
          <div>
            <h2>👨‍🍳 Kitchen — {orders.filter(o=>o.status!=='done').length} active orders</h2>
            {orders.length===0 && <p>No orders yet. Order from Menu!</p>}
            <div style={{ display:'grid', gap:12 }}>
              {orders.map(o=>(
                <div key={o.id} style={{ background:'white', padding:16, borderRadius:12, borderLeft:`6px solid ${o.status==='preparing'?'#F59E0B': o.status==='ready'?'#10B981':'#9CA3AF'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}><b>{o.id}</b><span>{o.time} • ${o.total.toFixed(2)} • {o.status.toUpperCase()}</span></div>
                  <div style={{ color:'#666', margin:'6px 0' }}>{o.items.map(i=>i.name).join(', ')}</div>
                  <div style={{ display:'flex', gap:8 }}>
                    {o.status==='preparing' && <button onClick={()=>setOrders(orders.map(x=> x.id===o.id? {...x, status:'ready'}:x))} style={{ background:'#10B981', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer' }}>Mark Ready</button>}
                    {o.status==='ready' && <button onClick={()=>setOrders(orders.map(x=> x.id===o.id? {...x, status:'done'}:x))} style={{ background:'#6B7280', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer' }}>Done</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='owner' && (
          <div>
            <h2>👑 Owner Dashboard</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:20 }}>
              <div style={{ background:'white', padding:20, borderRadius:12 }}><p>Total Orders</p><h1 style={{ margin:0 }}>{orders.length}</h1></div>
              <div style={{ background:'white', padding:20, borderRadius:12 }}><p>Revenue</p><h1 style={{ margin:0 }}>${revenue.toFixed(2)}</h1></div>
              <div style={{ background:'white', padding:20, borderRadius:12 }}><p>Active</p><h1 style={{ margin:0 }}>{orders.filter(o=>o.status!=='done').length}</h1></div>
            </div>
            <div style={{ background:'white', padding:20, borderRadius:12 }}>
              <h3>Recent Orders</h3>
              {orders.slice(0,10).map(o=> <div key={o.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee' }}><span>{o.id} — {o.items.length} items</span><span>${o.total.toFixed(2)} • {o.status}</span></div>)}
              {orders.length===0 && <p>No orders yet — Start from Menu tab!</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
