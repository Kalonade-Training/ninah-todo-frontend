import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

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

const toIsoUTC = (dateStr: string) => {
  if (!dateStr) return null as unknown as string;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).toISOString();
};

export default function TodosPage() {
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

      let list: any[] = [];
      if (Array.isArray(data)) list = data;
      else if (data && typeof data === "object" && Array.isArray((data as any).items)) {
        list = (data as any).items;
      }

      console.log("[TodosPage] RAW /todos[0] =", list[0]);
      setItems(list as ServerTodo[]);
      setErr(null);
    } catch (e: any) {
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
      const base = {
        Title: title,
        Body: body,
        DueDate: due ? toIsoUTC(due) : null,
      };

      if (editing) {
        const res = await api.patch(`/todos/${editing.ID}`, { ...base, UserID: editing.UserID });
        const updated: ServerTodo = res.data;
        setItems(prev => prev.map(p => (p.ID === editing.ID ? updated : p)));
      } else {
        const res = await api.post("/todos", base);
        const created: ServerTodo = res.data;
        setItems(prev => [created, ...prev]);
      }
      setOpen(false);
    } catch (e: any) {
      alert(e?.response?.data?.error ?? e?.response?.data ?? e?.message ?? "Save failed");
    }
  }

  async function toggleComplete(t: ServerTodo) {
    try {
      const res = await api.patch(`/todos/${t.ID}`, {
        UserID: t.UserID,
        Completed: !t.Completed,
      });
      const updated: ServerTodo = res.data;
      setItems(prev => prev.map(p => (p.ID === t.ID ? updated : p)));
    } catch (e: any) {
      alert(e?.response?.data?.error ?? e?.response?.data ?? "Update failed");
    }
  }

  async function duplicate(t: ServerTodo) {
    try {
      const res = await api.post(`/todos/${t.ID}/duplicate`, {
        UserID: t.UserID,
        Title: `${t.Title || "Untitled"} (copy)`,
      });
      const created: ServerTodo = res.data;
      setItems(prev => [created, ...prev]);
    } catch (e: any) {
      alert(e?.response?.data?.error ?? e?.response?.data ?? "Duplicate failed");
    }
  }

  async function remove(t: ServerTodo) {
    if (!confirm("Delete this todo?")) return;
    try {
      await api.delete(`/todos/${t.ID}`, { data: { UserID: t.UserID } });
      setItems(prev => prev.filter(p => p.ID !== t.ID));
    } catch (e: any) {
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
      {/* unmistakable marker so you KNOW this file is mounted */}
      <div className="text-xs font-mono p-2 rounded bg-yellow-100 text-yellow-900">
        DEBUG: TodosPage.tsx is mounted
      </div>

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
        {items.map(t => (
          <Card key={t.ID} className="p-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox checked={t.Completed} onCheckedChange={() => toggleComplete(t)} />
                <div className="font-semibold text-black dark:text-white">{t.Title || "(no title)"}</div>
              </div>
              {t.Body && <div className="text-sm opacity-80 whitespace-pre-wrap">{t.Body}</div>}
              <div className="text-xs opacity-70">
                {t.DueDate ? `Due ${format(new Date(t.DueDate), "yyyy-MM-dd")}` : "No due date"}
                {t.CompletedAt ? ` • Completed ${format(new Date(t.CompletedAt), "yyyy-MM-dd HH:mm")}` : ""}
              </div>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => openEdit(t)}>Edit</Button>
              <Button variant="secondary" onClick={() => duplicate(t)}>Duplicate</Button>
              <Button variant="destructive" onClick={() => remove(t)}>Delete</Button>
            </div>
          </Card>
        ))}
        {!loading && items.length === 0 && <Card className="p-6">No todos found.</Card>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Todo" : "New Todo"}</DialogTitle>
            <DialogDescription>Fill out the fields and click {editing ? "Save" : "Create"}.</DialogDescription>
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
