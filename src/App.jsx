import { useState } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { anyApi } from "convex/server";
import LoginView from "./components/LoginView";
import Sidebar from "./components/Sidebar";
import AdminHeader from "./components/AdminHeader";
import Overview from "./components/Overview";
import OrdersView from "./components/OrdersView";
import MenuView from "./components/MenuView";
import EventsView from "./components/EventsView";
import MenuEditor from "./components/MenuEditor";
import EventEditor from "./components/EventEditor";
import PricingView from "./components/PricingView";
import OptionGroupEditor from "./components/OptionGroupEditor";
import { optimizeEventImage, optimizeMenuImage } from "./imageOptimizer";

const api = anyApi;
const key = "patio_admin_session";
const sidebarKey = "patio_admin_sidebar_collapsed";

export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem(key) || "");
  const [view, setView] = useState("overview");
  const [sidebar, setSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(sidebarKey) === "true",
  );
  const [menuEditor, setMenuEditor] = useState(null);
  const [eventEditor, setEventEditor] = useState(null);
  const [pricingEditor, setPricingEditor] = useState(null);
  const [toast, setToast] = useState("");

  const overview = useQuery(
    api.dashboard.overview,
    token ? { sessionToken: token } : "skip",
  );
  const menu =
    useQuery(
      api.menuItems.adminList,
      token && (view === "menu" || view === "bottle-service")
        ? { sessionToken: token }
        : "skip",
    ) || [];
  const optionGroups =
    useQuery(
      api.optionGroups.adminList,
      token &&
      (view === "menu" ||
        view === "bottle-service" ||
        view === "pricing" ||
        menuEditor)
        ? { sessionToken: token }
        : "skip",
    ) || [];
  const orderPages = usePaginatedQuery(
    api.orders.adminPage,
    token && view === "orders" ? { sessionToken: token } : "skip",
    { initialNumItems: 50 },
  );
  const eventPages = usePaginatedQuery(
    api.events.adminPage,
    token && view === "events" ? { sessionToken: token } : "skip",
    { initialNumItems: 24 },
  );
  const orders = orderPages.results || [];
  const events = eventPages.results || [];
  const loginAdmin = useMutation(api.adminAuth.login);
  const logoutAdmin = useMutation(api.adminAuth.logout);
  const createMenu = useMutation(api.menuItems.create);
  const updateMenu = useMutation(api.menuItems.update);
  const removeMenu = useMutation(api.menuItems.remove);
  const generateMenuUploadUrl = useMutation(api.menuItems.generateUploadUrl);
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const removeEvent = useMutation(api.events.remove);
  const generateUploadUrl = useMutation(api.events.generateUploadUrl);
  const updateOrderStatus = useMutation(api.orders.updateStatus);
  const updateOrderPaid = useMutation(api.orders.updatePaid);
  const removeOrder = useMutation(api.orders.remove);
  const removeOrders = useMutation(api.orders.removeMany);
  const clearFinishedOrders = useMutation(api.orders.clearFinished);
  const createOptionGroup = useMutation(api.optionGroups.create);
  const updateOptionGroup = useMutation(api.optionGroups.update);
  const removeOptionGroup = useMutation(api.optionGroups.remove);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };
  async function login(username, password) {
    const result = await loginAdmin({ username, password });
    if (!result.ok) {
      const error = new Error(result.reason);
      error.attemptsRemaining = result.attemptsRemaining;
      throw error;
    }
    sessionStorage.setItem(key, result.token);
    setToken(result.token);
  }
  async function logout() {
    try {
      await logoutAdmin({ sessionToken: token });
    } catch {}
    sessionStorage.removeItem(key);
    setToken("");
  }
  async function updateOrder(id, field, value) {
    if (field === "status")
      await updateOrderStatus({ sessionToken: token, id, status: value });
    else await updateOrderPaid({ sessionToken: token, id, paid: value });
    notify("Order updated");
  }
  async function deleteOrder(id) {
    if (
      !confirm(
        "Permanently delete this order? Deleted orders are removed from revenue totals and cannot be restored.",
      )
    )
      return;
    await removeOrder({ sessionToken: token, id });
    notify("Order deleted");
  }
  async function clearOrders() {
    if (
      !confirm(
        "Clear every completed, cancelled, and refunded order from the admin list? Revenue history will be preserved.",
      )
    )
      return;
    const result = await clearFinishedOrders({ sessionToken: token });
    notify(
      result.cleared
        ? `${result.cleared} finished order${result.cleared === 1 ? "" : "s"} cleared`
        : "No finished orders to clear",
    );
  }
  async function deleteOrders(ids) {
    if (!ids.length) return false;
    if (
      !confirm(
        `Permanently delete ${ids.length} selected order${ids.length === 1 ? "" : "s"}? Deleted orders are removed from revenue totals and cannot be restored.`,
      )
    )
      return false;
    const result = await removeOrders({ sessionToken: token, ids });
    notify(
      `${result.deleted} order${result.deleted === 1 ? "" : "s"} deleted`,
    );
    return true;
  }
  async function saveMenu(data) {
    let { id, file, imageStorageId, imageUrl, removeImage, ...values } = data;
    if (file?.size) {
      file = await optimizeMenuImage(file);
      const url = await generateMenuUploadUrl({ sessionToken: token });
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error("Menu image upload failed.");
      ({ storageId: imageStorageId } = await response.json());
      imageUrl = undefined;
      removeImage = false;
    }
    const payload = {
      sessionToken: token,
      ...values,
      ...(imageStorageId ? { imageStorageId } : {}),
      ...(!imageStorageId && imageUrl ? { imageUrl } : {}),
    };
    if (id) await updateMenu({ id, removeImage, ...payload });
    else await createMenu(payload);
    setMenuEditor(null);
    notify("Menu item saved");
  }
  async function deleteMenu(id) {
    if (!confirm("Delete this menu item?")) return;
    await removeMenu({ sessionToken: token, id });
    notify("Menu item deleted");
  }
  async function saveEvent(data) {
    let { id, file, imageStorageId, imageUrl, removeImage, ...values } = data;
    if (file?.size) {
      file = await optimizeEventImage(file);
      const url = await generateUploadUrl({ sessionToken: token });
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error("Upload failed");
      ({ storageId: imageStorageId } = await response.json());
      imageUrl = undefined;
      removeImage = false;
    }
    const payload = {
      sessionToken: token,
      ...values,
      ...(imageStorageId ? { imageStorageId } : {}),
      ...(!imageStorageId && imageUrl ? { imageUrl } : {}),
    };
    if (id) await updateEvent({ id, removeImage, ...payload });
    else await createEvent(payload);
    setEventEditor(null);
    notify("Event saved");
  }
  async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    await removeEvent({ sessionToken: token, id });
    notify("Event deleted");
  }
  async function saveOptionGroup(data) {
    const { id, ...values } = data;
    const payload = { sessionToken: token, ...values };
    if (id) await updateOptionGroup({ id, ...payload });
    else await createOptionGroup(payload);
    setPricingEditor(null);
    notify("Pricing group saved");
  }
  async function deleteOptionGroup(id) {
    if (
      !confirm("Delete this option group? It will be removed from every drink.")
    )
      return;
    await removeOptionGroup({ sessionToken: token, id });
    notify("Pricing group deleted");
  }
  function toggleSidebarSize() {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem(sidebarKey, String(next));
      return next;
    });
  }

  if (!token) return <LoginView connected onLogin={login} />;
  const activeCount = overview?.activeCount || 0;
  return (
    <>
      <div
        className={`admin-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        {sidebar && (
          <button
            className="sidebar-scrim"
            aria-label="Close navigation"
            onClick={() => setSidebar(false)}
          />
        )}
        <Sidebar
          active={view}
          setActive={(next) => {
            setView(next);
            setSidebar(false);
          }}
          orderCount={activeCount}
          open={sidebar}
          onLogout={logout}
          collapsed={sidebarCollapsed}
          onCollapse={toggleSidebarSize}
        />
        <main className="admin-main">
          <AdminHeader
            view={view}
            onMenu={() => setSidebar((value) => !value)}
          />
          <div className="admin-content">
            {view === "overview" && (
              <Overview summary={overview} go={setView} />
            )}
            {view === "orders" && (
              <OrdersView
                orders={orders}
                status={orderPages.status}
                loadMore={() => orderPages.loadMore(50)}
                onStatus={(id, value) => updateOrder(id, "status", value)}
                onPaid={(id, value) => updateOrder(id, "paid", value)}
                onDelete={deleteOrder}
                onDeleteMany={deleteOrders}
                onClearFinished={clearOrders}
              />
            )}
            {view === "menu" && (
              <MenuView
                items={menu.filter((item) => !item.isBottleService)}
                onAdd={() => setMenuEditor({ mode: "new" })}
                onEdit={setMenuEditor}
                onDuplicate={(item) =>
                  setMenuEditor({
                    ...item,
                    _id: undefined,
                    name: `${item.name} copy`,
                    imageUrl: undefined,
                    imageStorageId: undefined,
                    sortOrder:
                      menu.filter((row) => !row.isBottleService).length + 1,
                  })
                }
                onDelete={deleteMenu}
              />
            )}
            {view === "bottle-service" && (
              <MenuView
                bottleService
                items={menu.filter((item) => item.isBottleService)}
                onAdd={() =>
                  setMenuEditor({ mode: "new", isBottleService: true })
                }
                onEdit={setMenuEditor}
                onDuplicate={(item) =>
                  setMenuEditor({
                    ...item,
                    _id: undefined,
                    name: `${item.name} copy`,
                    imageUrl: undefined,
                    imageStorageId: undefined,
                    sortOrder:
                      menu.filter((row) => row.isBottleService).length + 1,
                  })
                }
                onDelete={deleteMenu}
              />
            )}
            {view === "pricing" && (
              <PricingView
                groups={optionGroups}
                onAdd={() => setPricingEditor({ mode: "new" })}
                onEdit={setPricingEditor}
                onDuplicate={(group) =>
                  setPricingEditor({
                    ...group,
                    _id: undefined,
                    name: `${group.name} copy`,
                    sortOrder: optionGroups.length + 1,
                    options: group.options.map((option) => ({
                      ...option,
                      id: crypto.randomUUID(),
                    })),
                  })
                }
                onDelete={deleteOptionGroup}
              />
            )}
            {view === "events" && (
              <EventsView
                events={events}
                status={eventPages.status}
                loadMore={() => eventPages.loadMore(24)}
                onAdd={() => setEventEditor({ mode: "new" })}
                onEdit={setEventEditor}
                onDuplicate={(event) =>
                  setEventEditor({
                    ...event,
                    _id: undefined,
                    title: `${event.title} copy`,
                    imageUrl: undefined,
                    imageStorageId: undefined,
                    isPublished: false,
                  })
                }
                onDelete={deleteEvent}
              />
            )}
          </div>
        </main>
      </div>
      {menuEditor && (
        <MenuEditor
          item={menuEditor.mode === "new" ? null : menuEditor}
          bottleService={Boolean(menuEditor.isBottleService)}
          count={menu.length}
          optionGroups={optionGroups}
          onClose={() => setMenuEditor(null)}
          onSave={saveMenu}
        />
      )}
      {eventEditor && (
        <EventEditor
          event={eventEditor.mode === "new" ? null : eventEditor}
          onClose={() => setEventEditor(null)}
          onSave={saveEvent}
        />
      )}
      {pricingEditor && (
        <OptionGroupEditor
          group={pricingEditor.mode === "new" ? null : pricingEditor}
          count={optionGroups.length}
          onClose={() => setPricingEditor(null)}
          onSave={saveOptionGroup}
        />
      )}
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
