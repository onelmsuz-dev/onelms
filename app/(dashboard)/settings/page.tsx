"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MOCK_BRANCHES, MOCK_ROOMS } from "@/lib/mock-data";
import type { Branch, Room } from "@/types";
import {
  Shield, Plus, Trash2, Edit, User, Building, Bell,
  MapPin, DoorOpen, Phone, Users, CheckCircle, XCircle,
} from "lucide-react";

const roles = [
  { id: "r1", name: "Super Admin", description: "Barcha imkoniyatlarga to'liq kirish", users: 1, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", permissions: ["Dashboard", "Lidlar", "O'quvchilar", "O'qituvchilar", "Kurslar", "Moliya", "Hisobotlar", "Sozlamalar"] },
  { id: "r2", name: "Administrator", description: "Kunlik operatsiyalarni boshqarish", users: 2, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", permissions: ["Dashboard", "Lidlar", "O'quvchilar", "Davomat", "Moliya"] },
  { id: "r3", name: "O'qituvchi", description: "Guruhlar va davomatni boshqarish", users: 6, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", permissions: ["O'z guruhlari", "Davomat", "Jadval"] },
  { id: "r4", name: "Marketing", description: "Lidlar va reklama boshqarish", users: 1, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", permissions: ["Lidlar", "Hisobotlar (cheklangan)"] },
];

const staff = [
  { id: "u1", name: "Sarvar Abdullayev", role: "Administrator", phone: "+998 90 111 1111", status: "active" },
  { id: "u2", name: "Nilufar Baxtiyorova", role: "Marketing", phone: "+998 91 222 2222", status: "active" },
  { id: "u3", name: "Mohira Xasanova", role: "O'qituvchi", phone: "+998 90 100 2000", status: "active" },
  { id: "u4", name: "Jamshid Tursunov", role: "O'qituvchi", phone: "+998 91 200 3000", status: "active" },
];

const ROOM_TYPE_LABELS: Record<string, string> = {
  dars_xonasi: "Dars xonasi",
  kompyuter_lab: "Kompyuter lab",
  sport_zal: "Sport zal",
  akt_zal: "Akt zal",
};

const ROOM_TYPE_COLORS: Record<string, string> = {
  dars_xonasi: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  kompyuter_lab: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  sport_zal: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  akt_zal: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const sections = [
  { id: "markaz",      label: "O'quv markaz",    icon: Building },
  { id: "filliallar",  label: "Filliallar",       icon: MapPin },
  { id: "xonalar",     label: "Xonalar",          icon: DoorOpen },
  { id: "rollar",      label: "Rollar",           icon: Shield },
  { id: "hodimlar",    label: "Hodimlar",         icon: User },
  { id: "bildirishnoma", label: "Bildirishnomalar", icon: Bell },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("markaz");
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);

  const [showBranchForm, setShowBranchForm] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "", address: "", phone: "", managerName: "" });

  const [showRoomForm, setShowRoomForm] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", branchId: "b1", capacity: "", type: "dars_xonasi" });

  const addBranch = () => {
    if (!newBranch.name || !newBranch.address) return;
    const branch: Branch = {
      id: `b${branches.length + 1}`,
      ...newBranch,
      studentCount: 0,
      roomCount: 0,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBranches(prev => [...prev, branch]);
    setNewBranch({ name: "", address: "", phone: "", managerName: "" });
    setShowBranchForm(false);
  };

  const addRoom = () => {
    if (!newRoom.name || !newRoom.branchId) return;
    const branch = branches.find(b => b.id === newRoom.branchId);
    const room: Room = {
      id: `r${rooms.length + 1}`,
      branchId: newRoom.branchId,
      branchName: branch?.name ?? "",
      name: newRoom.name,
      capacity: Number(newRoom.capacity) || 15,
      type: newRoom.type as Room["type"],
      status: "active",
    };
    setRooms(prev => [...prev, room]);
    setNewRoom({ name: "", branchId: "b1", capacity: "", type: "dars_xonasi" });
    setShowRoomForm(false);
  };

  return (
    <div>
      <TopHeader title="Sozlamalar" subtitle="Tizim va markaz sozlamalari" />

      <div className="p-6 flex gap-6">
        {/* Sidebar nav */}
        <div className="w-52 shrink-0">
          <nav className="space-y-0.5">
            {sections.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeSection === s.id
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-3xl space-y-4">

          {/* ── O'quv markaz ── */}
          {activeSection === "markaz" && (
            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px]">O'quv markaz ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Markaz nomi", value: "Smart O'quv Markaz", type: "text" },
                  { label: "Telefon", value: "+998 71 200 0000", type: "tel" },
                  { label: "Manzil", value: "Toshkent, Chilonzor tumani", type: "text" },
                  { label: "Subdomen", value: "smart-markaz", suffix: ".onelms.uz", type: "text" },
                ].map(field => (
                  <div key={field.label}>
                    <Label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 block">{field.label}</Label>
                    <div className="flex">
                      <Input type={field.type} defaultValue={field.value}
                        className={cn("h-9 text-sm", field.suffix && "rounded-r-none")} />
                      {field.suffix && (
                        <span className="flex items-center px-3 bg-neutral-100 dark:bg-neutral-800 border border-l-0 border-neutral-200 dark:border-neutral-700 rounded-r-lg text-sm text-neutral-500">
                          {field.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 mt-2">Saqlash</Button>
              </CardContent>
            </Card>
          )}

          {/* ── Filliallar ── */}
          {activeSection === "filliallar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{branches.length} ta filial</p>
                <Button size="sm" onClick={() => setShowBranchForm(v => !v)}
                  className="gap-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 text-xs h-8">
                  <Plus className="w-3.5 h-3.5" />
                  Filial qo'shish
                </Button>
              </div>

              {/* Add form */}
              {showBranchForm && (
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-none">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Yangi filial</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-neutral-500 mb-1 block">Filial nomi *</Label>
                        <Input placeholder="Masalan: Mirzo Ulug'bek filiali" value={newBranch.name}
                          onChange={e => setNewBranch(p => ({ ...p, name: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-neutral-500 mb-1 block">Telefon</Label>
                        <Input placeholder="+998 71 ..." value={newBranch.phone}
                          onChange={e => setNewBranch(p => ({ ...p, phone: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-neutral-500 mb-1 block">Manzil *</Label>
                        <Input placeholder="Shahar, tuman, ko'cha" value={newBranch.address}
                          onChange={e => setNewBranch(p => ({ ...p, address: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-neutral-500 mb-1 block">Mas'ul shaxs</Label>
                        <Input placeholder="F.I.Sh." value={newBranch.managerName}
                          onChange={e => setNewBranch(p => ({ ...p, managerName: e.target.value }))} className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addBranch} className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 h-8 text-xs">Saqlash</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowBranchForm(false)} className="h-8 text-xs">Bekor</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Branch list */}
              <div className="space-y-3">
                {branches.map(branch => (
                  <Card key={branch.id} className="border border-neutral-200 dark:border-neutral-800 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center shrink-0">
                            <Building className="w-5 h-5 text-neutral-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[14px] text-neutral-900 dark:text-neutral-100">{branch.name}</h3>
                              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium",
                                branch.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-neutral-100 text-neutral-500")}>
                                {branch.status === "active" ? "Faol" : "Nofaol"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-neutral-400" />
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">{branch.address}</p>
                            </div>
                            {branch.phone && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-neutral-400" />
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{branch.phone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">{branch.studentCount} o'quvchi</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DoorOpen className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">{branch.roomCount} xona</span>
                        </div>
                        {branch.managerName && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">{branch.managerName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── Xonalar ── */}
          {activeSection === "xonalar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{rooms.length} ta xona</p>
                <Button size="sm" onClick={() => setShowRoomForm(v => !v)}
                  className="gap-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 text-xs h-8">
                  <Plus className="w-3.5 h-3.5" />
                  Xona qo'shish
                </Button>
              </div>

              {/* Add room form */}
              {showRoomForm && (
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-none">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Yangi xona</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-neutral-500 mb-1 block">Xona nomi *</Label>
                        <Input placeholder="Masalan: 4-xona" value={newRoom.name}
                          onChange={e => setNewRoom(p => ({ ...p, name: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-neutral-500 mb-1 block">Sig'imi (o'quvchi)</Label>
                        <Input type="number" placeholder="15" value={newRoom.capacity}
                          onChange={e => setNewRoom(p => ({ ...p, capacity: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-neutral-500 mb-1 block">Filial</Label>
                        <select value={newRoom.branchId} onChange={e => setNewRoom(p => ({ ...p, branchId: e.target.value }))}
                          className="w-full h-8 px-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none">
                          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-neutral-500 mb-1 block">Xona turi</Label>
                        <select value={newRoom.type} onChange={e => setNewRoom(p => ({ ...p, type: e.target.value }))}
                          className="w-full h-8 px-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none">
                          {Object.entries(ROOM_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addRoom} className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 h-8 text-xs">Saqlash</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowRoomForm(false)} className="h-8 text-xs">Bekor</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Group by branch */}
              {branches.map(branch => {
                const branchRooms = rooms.filter(r => r.branchId === branch.id);
                return (
                  <div key={branch.id}>
                    <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Building className="w-3.5 h-3.5" />
                      {branch.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {branchRooms.map(room => (
                        <Card key={room.id} className="border border-neutral-200 dark:border-neutral-800 shadow-none">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center shrink-0">
                              <DoorOpen className="w-4 h-4 text-neutral-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{room.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", ROOM_TYPE_COLORS[room.type])}>
                                  {ROOM_TYPE_LABELS[room.type]}
                                </span>
                                <span className="text-[10px] text-neutral-400">{room.capacity} o'rin</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {room.status === "active"
                                ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                : <XCircle className="w-4 h-4 text-neutral-300" />
                              }
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-red-600">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Rollar ── */}
          {activeSection === "rollar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Tizimda mavjud rollar</p>
                <Button size="sm" className="gap-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 text-xs h-8">
                  <Plus className="w-3.5 h-3.5" /> Rol qo'shish
                </Button>
              </div>
              {roles.map(role => (
                <Card key={role.id} className="border border-neutral-200 dark:border-neutral-800 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{role.name}</h3>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", role.color)}>
                            {role.users} ta hodim
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{role.description}</p>
                      </div>
                      {role.id !== "r1" && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"><Edit className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map(p => (
                        <span key={p} className="text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-md">{p}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── Hodimlar ── */}
          {activeSection === "hodimlar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Tizimga kirish huquqiga ega hodimlar</p>
                <Button size="sm" className="gap-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 text-xs h-8">
                  <Plus className="w-3.5 h-3.5" /> Hodim qo'shish
                </Button>
              </div>
              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-none">
                <CardContent className="p-0">
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {staff.map(user => (
                      <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.name}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{user.role}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Bildirishnomalar ── */}
          {activeSection === "bildirishnoma" && (
            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px]">Bildirishnoma sozlamalari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { label: "SMS bildirishnomalar (Eskiz.uz orqali)", checked: true },
                  { label: "Davomat haqida ota-onaga SMS", checked: true },
                  { label: "To'lov eslatmasi (oylik)", checked: true },
                  { label: "Yangi lid qo'shilganda email", checked: false },
                  { label: "Telegram bot bildirishnomalari", checked: false },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{item.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                      <div className="w-9 h-5 bg-neutral-200 dark:bg-neutral-700 rounded-full peer peer-checked:bg-neutral-900 dark:peer-checked:bg-neutral-100 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white dark:after:bg-neutral-900 after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </div>
                ))}
                <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 mt-3">Saqlash</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
