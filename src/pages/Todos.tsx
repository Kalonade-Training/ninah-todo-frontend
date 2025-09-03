import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { useTodoServices } from "@/interface/hooks/useTodoServices";
import type { Todo } from "@/domain/models";

export default function Todos() {
  const { token } = useAuth();
  const { listTodos, createTodo, updateTodo, deleteTodo, duplicateTodo } = useTodoServices();

  const [items, setItems] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [qTitle, setQTitle] = useState("");
  const [qBody, setQBody] = useState("");
  const [qFrom, setQFrom] = useState("");
  const [qTo, setQTo] = useState("");
  const [qCompleted, setQCompleted] = useState<"" | "true" | "false">("");

  const filter = useMemo(() => ({
    title: qTitle || undefined,
    body: qBody || undefined,
    due_from: qFrom || undefined,
    due_to: qTo || undefined,
    completed:
      qCompleted === "" ? undefined : (qCompleted === "true" ? true : false),
  }), [qTitle, qBody, qFrom, qTo, qCompleted]);

  async function load() {
    try {
      setLoading(true);
      const data = await listTodos(filter);
      setItems(data);
      setErr(null);
    } catch (e: any) {
      const msg = e?.response?.data?.error || "Failed to load todos";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) load(); }, [token, filter]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [due, setDue] = useState("");

  function openCreate() {
    setEditing(null); setTitle(""); setBody(""); setDue(""); setOpen(true);
  }
  function openEdit(t: Todo) {
    setEditing(t); setTitle(t.title); setBody(t.body ?? ""); setDue(t.dueDate ?? ""); setOpen(true);
  }

  async function save() {
    try {
      if (editing) {
        const data = await updateTodo(editing.id, { title, body, due_date: due || undefined });
        setItems(prev => prev.map(p => p.id === editing.id ? data : p));
        toast.success("Todo updated");
      } else {
        const data = await createTodo({ title, body, due_date: due || undefined });
        setItems(prev => [data, ...prev]);
        toast.success("Todo created");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Save failed");
    }
  }

  async function toggleComplete(t: Todo) {
    try {
      const data = await updateTodo(t.id, { completed: !t.completed });
      setItems(prev => prev.map(p => p.id === t.id ? data : p));
      toast.success(data.completed ? "Marked complete" : "Marked incomplete");
    } catch {
      toast.error("Update failed");
    }
  }

  async function duplicate(t: Todo) {
    try {
      const data = await duplicateTodo(t.id);
      setItems(prev => [data, ...prev]);
      toast.success(`Duplicated "${t.title}"`);
    } catch {
      toast.error("Duplicate failed");
    }
  }

  async function remove(t: Todo) {
    if (!confirm("Delete this todo?")) return;
    try {
      await deleteTodo(t.id);
      setItems(prev => prev.filter(p => p.id !== t.id));
      toast.success("Todo deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  if (!token) {
    return <div className="max-w-md mx-auto p-4"><Card className="p-6">Please login first.</Card></div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* filters + create */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1">
          <label className="text-sm">Title</label>
          <Input value={qTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQTitle(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="text-sm">Body</label>
          <Input value={qBody} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQBody(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Due from</label>
          <Input type="date" value={qFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Due to</label>
          <Input type="date" value={qTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQTo(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Completed</label>
          <select
            className="border rounded h-10 px-2"
            value={qCompleted}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQCompleted(e.target.value as any)}
          >
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
          <Card key={t.id} className="p-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox checked={t.completed} onCheckedChange={() => toggleComplete(t)} />
                <div className="font-semibold">{t.title}</div>
              </div>
              {t.body && <div className="text-sm text-muted-foreground whitespace-pre-wrap">{t.body}</div>}
              <div className="text-xs text-muted-foreground">
                {t.dueDate ? `Due ${format(new Date(t.dueDate), "yyyy-MM-dd")}` : "No due date"}
                {t.completedAt ? ` • Completed ${format(new Date(t.completedAt), "yyyy-MM-dd HH:mm")}` : ""}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Todo" : "New Todo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title (<=50)" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} maxLength={50} required />
            <Textarea placeholder="Body (<=1000)" value={body} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)} maxLength={1000} />
            <div>
              <label className="text-sm">Due date</label>
              <Input type="date" value={due} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDue(e.target.value)} />
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
