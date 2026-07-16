import { useState } from 'react'
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react'
import { anyApi } from 'convex/server'
import LoginView from './components/LoginView'
import Sidebar from './components/Sidebar'
import AdminHeader from './components/AdminHeader'
import Overview from './components/Overview'
import OrdersView from './components/OrdersView'
import MenuView from './components/MenuView'
import EventsView from './components/EventsView'
import MenuEditor from './components/MenuEditor'
import EventEditor from './components/EventEditor'
import { optimizeEventImage, optimizeMenuImage } from './imageOptimizer'

const api = anyApi
const key = 'patio_admin_session'

export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem(key) || '')
  const [view, setView] = useState('overview')
  const [sidebar, setSidebar] = useState(false)
  const [menuEditor, setMenuEditor] = useState(null)
  const [eventEditor, setEventEditor] = useState(null)
  const [toast, setToast] = useState('')

  const overview = useQuery(api.dashboard.overview, token ? { sessionToken: token } : 'skip')
  const menu = useQuery(api.menuItems.adminList, token && view === 'menu' ? { sessionToken: token } : 'skip') || []
  const orderPages = usePaginatedQuery(api.orders.adminPage, token && view === 'orders' ? { sessionToken: token } : 'skip', { initialNumItems: 50 })
  const eventPages = usePaginatedQuery(api.events.adminPage, token && view === 'events' ? { sessionToken: token } : 'skip', { initialNumItems: 24 })
  const orders = orderPages.results || []
  const events = eventPages.results || []
  const loginAdmin = useMutation(api.adminAuth.login)
  const logoutAdmin = useMutation(api.adminAuth.logout)
  const createMenu = useMutation(api.menuItems.create)
  const updateMenu = useMutation(api.menuItems.update)
  const removeMenu = useMutation(api.menuItems.remove)
  const generateMenuUploadUrl = useMutation(api.menuItems.generateUploadUrl)
  const createEvent = useMutation(api.events.create)
  const updateEvent = useMutation(api.events.update)
  const removeEvent = useMutation(api.events.remove)
  const generateUploadUrl = useMutation(api.events.generateUploadUrl)
  const updateOrderStatus = useMutation(api.orders.updateStatus)
  const updateOrderPaid = useMutation(api.orders.updatePaid)

  const notify = message => { setToast(message); setTimeout(() => setToast(''), 2400) }
  async function login(username, password) {
    const result = await loginAdmin({ username, password })
    if (!result.ok) {
      const error = new Error(result.reason)
      error.attemptsRemaining = result.attemptsRemaining
      throw error
    }
    sessionStorage.setItem(key, result.token); setToken(result.token)
  }
  async function logout() { try { await logoutAdmin({ sessionToken: token }) } catch {} sessionStorage.removeItem(key); setToken('') }
  async function updateOrder(id, field, value) { if (field === 'status') await updateOrderStatus({ sessionToken: token, id, status: value }); else await updateOrderPaid({ sessionToken: token, id, paid: value }); notify('Order updated') }
  async function saveMenu(data) { let { id, file, imageStorageId, imageUrl, removeImage, ...values } = data; if (file?.size) { file = await optimizeMenuImage(file); const url = await generateMenuUploadUrl({ sessionToken: token }); const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': file.type }, body: file }); if (!response.ok) throw new Error('Menu image upload failed.'); ({ storageId: imageStorageId } = await response.json()); imageUrl = undefined; removeImage = false } const payload = { sessionToken: token, ...values, ...(imageStorageId ? { imageStorageId } : {}), ...(!imageStorageId && imageUrl ? { imageUrl } : {}) }; if (id) await updateMenu({ id, removeImage, ...payload }); else await createMenu(payload); setMenuEditor(null); notify('Menu item saved') }
  async function deleteMenu(id) { if (!confirm('Delete this menu item?')) return; await removeMenu({ sessionToken: token, id }); notify('Menu item deleted') }
  async function saveEvent(data) { let { id, file, imageStorageId, imageUrl, ...values } = data; if (file?.size) { file = await optimizeEventImage(file); const url = await generateUploadUrl({ sessionToken: token }); const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': file.type }, body: file }); if (!response.ok) throw new Error('Upload failed'); ({ storageId: imageStorageId } = await response.json()); imageUrl = undefined } const payload = { sessionToken: token, ...values, ...(imageStorageId ? { imageStorageId } : {}), ...(!imageStorageId && imageUrl ? { imageUrl } : {}) }; if (id) await updateEvent({ id, ...payload }); else await createEvent(payload); setEventEditor(null); notify('Event saved') }
  async function deleteEvent(id) { if (!confirm('Delete this event?')) return; await removeEvent({ sessionToken: token, id }); notify('Event deleted') }

  if (!token) return <LoginView connected onLogin={login} />
  const activeCount = overview?.activeCount || 0
  return <>
    <div className="admin-shell">{sidebar && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebar(false)}/>}<Sidebar active={view} setActive={next => { setView(next); setSidebar(false) }} orderCount={activeCount} open={sidebar} onLogout={logout}/><main className="admin-main"><AdminHeader view={view} onMenu={() => setSidebar(value => !value)}/><div className="admin-content">
      {view === 'overview' && <Overview summary={overview} go={setView}/>} 
      {view === 'orders' && <OrdersView orders={orders} status={orderPages.status} loadMore={() => orderPages.loadMore(50)} onStatus={(id,value) => updateOrder(id,'status',value)} onPaid={(id,value) => updateOrder(id,'paid',value)}/>} 
      {view === 'menu' && <MenuView items={menu} onAdd={() => setMenuEditor({ mode: 'new' })} onEdit={setMenuEditor} onDelete={deleteMenu}/>} 
      {view === 'events' && <EventsView events={events} status={eventPages.status} loadMore={() => eventPages.loadMore(24)} onAdd={() => setEventEditor({ mode: 'new' })} onEdit={setEventEditor} onDelete={deleteEvent}/>} 
    </div></main></div>
    {menuEditor && <MenuEditor item={menuEditor.mode === 'new' ? null : menuEditor} count={menu.length} onClose={() => setMenuEditor(null)} onSave={saveMenu}/>} 
    {eventEditor && <EventEditor event={eventEditor.mode === 'new' ? null : eventEditor} onClose={() => setEventEditor(null)} onSave={saveEvent}/>} 
    <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
  </>
}
