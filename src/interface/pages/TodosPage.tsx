import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

type ServerTodoRaw = any;

type ServerTodo = {
  ID: string;
  UserID: string;
  Title: string;
  Body: string;
  DueDate: string | null;
  Completed: boolean;
  CompletedAt?: string | null;
  CreatedAt?: string | null;
  UpdatedAt?: string | null;
};

function normalize(r: ServerTodoRaw, idx: number): ServerTodo {
  // Check all possible field name variations
  const id = r?.ID ?? r?.id ?? r?.Id ?? r?._id ?? "";
  const userID = r?.UserID ?? r?.userID ?? r?.userId ?? r?.user_id ?? "";
  
  return {
    ID: String(id || `MISSING-${idx}`),
    UserID: String(userID || ""),
    Title: r?.Title ?? r?.title ?? "",
    Body: r?.Body ?? r?.body ?? "",
    DueDate: r?.DueDate ?? r?.dueDate ?? r?.due_date ?? null,
    Completed: Boolean(r?.Completed ?? r?.completed),
    CompletedAt: r?.CompletedAt ?? r?.completedAt ?? r?.completed_at ?? null,
    CreatedAt: r?.CreatedAt ?? r?.createdAt ?? r?.created_at ?? null,
    UpdatedAt: r?.UpdatedAt ?? r?.updatedAt ?? r?.updated_at ?? null,
  };
}

const toIsoUTC = (dateStr: string) => {
  if (!dateStr) return null as unknown as string;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).toISOString();
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 10);
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export default function Todos() {
  const { token } = useAuth();

  const [items, setItems] = useState<ServerTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [qTitle, setQTitle] = useState("");
  const [qBody, setQBody] = useState("");
  const [qFrom, setQFrom] = useState("");
  const [qTo, setQTo] = useState("");
  const [qCompleted, setQCompleted] = useState<"" | "true" | "false">("");

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (qTitle) p.set("title", qTitle);
    if (qBody) p.set("body", qBody);
    if (qFrom) p.set("due_from", qFrom);
    if (qTo) p.set("due_to", qTo);
    if (qCompleted) p.set("completed", qCompleted);
    return p.toString();
  }, [qTitle, qBody, qFrom, qTo, qCompleted]);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/todos" + (queryString ? `?${queryString}` : ""));
      const data: unknown = res.data;

      // Debug logging to see what we're receiving
      console.log("Raw response from /todos:", data);

      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === "object") {
        // Check for various possible wrapper properties
        if (Array.isArray((data as any).items)) {
          list = (data as any).items;
        } else if (Array.isArray((data as any).todos)) {
          list = (data as any).todos;
        } else if (Array.isArray((data as any).data)) {
          list = (data as any).data;
        }
      }

      // Debug logging to see individual items
      if (list.length > 0) {
        console.log("First todo item structure:", list[0]);
      }

      const mapped = list.map((r, i) => normalize(r, i));
      setItems(mapped);
      setErr(null);
    } catch (e: any) {
      console.error("Error loading todos:", e);
      setErr(e?.response?.data?.error || "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
  }, [token, queryString]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServerTodo | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [due, setDue] = useState("");

  function openCreate() {
    setEditing(null);
    setTitle("");
    setBody("");
    setDue("");
    setOpen(true);
  }

  function openEdit(t: ServerTodo) {
    setEditing(t);
    setTitle(t.Title ?? "");
    setBody(t.Body ?? "");
    setDue(t.DueDate ? t.DueDate.slice(0, 10) : "");
    setOpen(true);
  }

  async function save() {
    try {
      // Create payload with exact field names your Go backend expects
      // Try both lowercase and PascalCase to see which works
      const payload = {
        title: title,
        body: body,
        due_date: due ? toIsoUTC(due) : null
      };

      console.log("Sending payload:", payload);

      if (editing) {
        if (!editing.ID || editing.ID.startsWith("MISSING-")) {
          alert("Cannot save: missing todo ID from server.");
          return;
        }
        const res = await api.patch(`/todos/${editing.ID}`, payload);
        console.log("Update response:", res.data);
        const updated = normalize(res.data, 0);
        setItems(prev => prev.map(p => (p.ID === editing.ID ? updated : p)));
      } else {
        const res = await api.post("/todos", payload);
        console.log("Create response:", res.data);
        const created = normalize(res.data, 0);
        setItems(prev => [created, ...prev]);
      }
      setOpen(false);
    } catch (e: any) {
      console.error("Save error:", e?.response?.data);
      alert(e?.response?.data?.error ?? e?.response?.data ?? e?.message ?? "Save failed");
    }
  }

  async function toggleComplete(t: ServerTodo) {
    try {
      if (!t.ID || t.ID.startsWith("MISSING-")) {
        alert("Cannot update: missing todo ID from server.");
        return;
      }
      
      // Try lowercase field name
      const payload = { completed: !t.Completed };
      console.log("Toggle payload:", payload);
      
      const res = await api.patch(`/todos/${t.ID}`, payload);
      console.log("Toggle response:", res.data);
      const updated = normalize(res.data, 0);
      setItems(prev => prev.map(p => (p.ID === t.ID ? updated : p)));
    } catch (e: any) {
      console.error("Toggle error:", e?.response?.data);
      alert(e?.response?.data?.error ?? e?.response?.data ?? "Update failed");
    }
  }

  async function duplicate(t: ServerTodo) {
    try {
      if (!t.ID || t.ID.startsWith("MISSING-")) {
        alert("Cannot duplicate: missing todo ID from server.");
        return;
      }
      const res = await api.post(`/todos/${t.ID}/duplicate`);
      console.log("Duplicate response:", res.data);
      const created = normalize(res.data, 0);
      setItems(prev => [created, ...prev]);
    } catch (e: any) {
      console.error("Duplicate error:", e?.response?.data);
      alert(e?.response?.data?.error ?? e?.response?.data ?? "Duplicate failed");
    }
  }

  async function remove(t: ServerTodo) {
    if (!confirm("Delete this todo?")) return;
    try {
      if (!t.ID || t.ID.startsWith("MISSING-")) {
        alert("Cannot delete: missing todo ID from server.");
        return;
      }
      await api.delete(`/todos/${t.ID}`);
      setItems(prev => prev.filter(p => p.ID !== t.ID));
    } catch (e: any) {
      console.error("Delete error:", e?.response?.data);
      alert(e?.response?.data?.error ?? e?.response?.data ?? "Delete failed");
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Card className="p-6">Please login first.</Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-sm">Title</label>
          <Input placeholder="search title..." value={qTitle} onChange={e => setQTitle(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="text-sm">Body</label>
          <Input placeholder="search body..." value={qBody} onChange={e => setQBody(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Due from</label>
          <Input type="date" value={qFrom} onChange={e => setQFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Due to</label>
          <Input type="date" value={qTo} onChange={e => setQTo(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Completed</label>
          <select className="border rounded h-10 px-2" value={qCompleted} onChange={e => setQCompleted(e.target.value as any)}>
            <option value="">Any</option>
            <option value="true">Done</option>
            <option value="false">Not done</option>
          </select>
        </div>
        <Button onClick={load}>Search</Button>
        <Button onClick={openCreate}>New</Button>
      </div>

      {loading && <Card className="p-6">Loading...</Card>}
      {err && <Card className="p-6 text-red-600">{err}</Card>}

      <div className="space-y-3">
        {items.map((t, i) => (
          <Card key={t.ID || `fallback-${i}`} className="p-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox checked={t.Completed} onCheckedChange={() => toggleComplete(t)} />
                <div className="font-semibold">{t.Title || "(no title)"}</div>
              </div>
              {t.Body && <div className="text-sm opacity-80 whitespace-pre-wrap">{t.Body}</div>}
              <div className="text-xs opacity-70">
                {t.DueDate ? `Due ${formatDate(t.DueDate)}` : "No due date"}
                {t.CompletedAt ? ` • Completed ${formatDateTime(t.CompletedAt)}` : ""}
              </div>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Edit</Button>
              <Button variant="secondary" size="sm" onClick={() => duplicate(t)}>Duplicate</Button>
              <Button variant="destructive" size="sm" onClick={() => remove(t)}>Delete</Button>
            </div>
          </Card>
        ))}
        {!loading && items.length === 0 && <Card className="p-6">No todos found.</Card>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby="todo-dialog-desc">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Todo" : "New Todo"}</DialogTitle>
            <DialogDescription id="todo-dialog-desc">
              Fill out the fields and click {editing ? "Save" : "Create"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title (<=50)" value={title} onChange={e => setTitle(e.target.value)} maxLength={50} required />
            <Textarea placeholder="Body (<=1000)" value={body} onChange={e => setBody(e.target.value)} maxLength={1000} />
            <div>
              <label className="text-sm">Due date</label>
              <Input type="date" value={due} onChange={e => setDue(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}