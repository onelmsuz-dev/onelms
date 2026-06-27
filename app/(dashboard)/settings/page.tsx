"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Plus, Trash2, Edit, User, Building, Bell } from "lucide-react";

const roles = [
  {
    id: "r1",
    name: "Super Admin",
    description: "Barcha imkoniyatlarga to'liq kirish",
    users: 1,
    color: "bg-red-100 text-red-700",
    permissions: ["Dashboard", "Lidlar", "O'quvchilar", "O'qituvchilar", "Kurslar", "Moliya", "Hisobotlar", "Sozlamalar"],
  },
  {
    id: "r2",
    name: "Administrator",
    description: "Kunlik operatsiyalarni boshqarish",
    users: 2,
    color: "bg-blue-100 text-blue-700",
    permissions: ["Dashboard", "Lidlar", "O'quvchilar", "Davomat", "Moliya"],
  },
  {
    id: "r3",
    name: "O'qituvchi",
    description: "Guruhlar va davomatni boshqarish",
    users: 6,
    color: "bg-green-100 text-green-700",
    permissions: ["O'z guruhlari", "Davomat", "Jadval"],
  },
  {
    id: "r4",
    name: "Marketing",
    description: "Lidlar va reklama boshqarish",
    users: 1,
    color: "bg-purple-100 text-purple-700",
    permissions: ["Lidlar", "Hisobotlar (cheklangan)"],
  },
];

const staff = [
  { id: "u1", name: "Sarvar Abdullayev", role: "Administrator", phone: "+998 90 111 1111", status: "active" },
  { id: "u2", name: "Nilufar Baxtiyorova", role: "Marketing", phone: "+998 91 222 2222", status: "active" },
  { id: "u3", name: "Mohira Xasanova", role: "O'qituvchi", phone: "+998 90 100 2000", status: "active" },
  { id: "u4", name: "Jamshid Tursunov", role: "O'qituvchi", phone: "+998 91 200 3000", status: "active" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("markaz");

  const sections = [
    { id: "markaz", label: "O'quv markaz", icon: Building },
    { id: "rollar", label: "Rollar", icon: Shield },
    { id: "hodimlar", label: "Hodimlar", icon: User },
    { id: "bildirishnoma", label: "Bildirishnomalar", icon: Bell },
  ];

  return (
    <div>
      <TopHeader title="Sozlamalar" subtitle="Tizim va markaz sozlamalari" />

      <div className="p-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-52 shrink-0">
          <nav className="space-y-1">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeSection === s.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl space-y-5">
          {activeSection === "markaz" && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">O'quv markaz ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Markaz nomi", value: "Smart O'quv Markaz", type: "text" },
                  { label: "Telefon", value: "+998 71 200 0000", type: "tel" },
                  { label: "Manzil", value: "Toshkent, Chilonzor tumani", type: "text" },
                  { label: "Subdomen", value: "smart-markaz", suffix: ".onelms.uz", type: "text" },
                ].map((field) => (
                  <div key={field.label}>
                    <Label className="text-xs font-medium text-gray-600 dark:text-neutral-400 mb-1.5 block">{field.label}</Label>
                    <div className="flex">
                      <Input
                        type={field.type}
                        defaultValue={field.value}
                        className={`h-9 text-sm ${field.suffix ? "rounded-r-none" : ""}`}
                      />
                      {field.suffix && (
                        <span className="flex items-center px-3 bg-gray-100 dark:bg-neutral-800 border border-l-0 border-gray-200 dark:border-neutral-700 rounded-r-lg text-sm text-gray-500 dark:text-neutral-400">
                          {field.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <Button className="bg-blue-600 hover:bg-blue-700 mt-2">Saqlash</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "rollar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-neutral-400">Tizimda mavjud rollar va ularning ruxsatlari</p>
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Rol qo'shish
                </Button>
              </div>
              {roles.map((role) => (
                <Card key={role.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-neutral-100">{role.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.color}`}>
                            {role.users} ta hodim
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-neutral-400">{role.description}</p>
                      </div>
                      {role.id !== "r1" && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-blue-600">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map((p) => (
                        <span key={p} className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 px-2 py-0.5 rounded-md">
                          {p}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeSection === "hodimlar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-neutral-400">Tizimga kirish huquqiga ega hodimlar</p>
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Hodim qo'shish
                </Button>
              </div>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {staff.map((user) => (
                      <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-neutral-400">{user.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{user.role}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "bildirishnoma" && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Bildirishnoma sozlamalari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "SMS bildirishnomalar (Eskiz.uz orqali)", checked: true },
                  { label: "Davomat haqida ota-onaga SMS", checked: true },
                  { label: "To'lov eslatmasi (oylik)", checked: true },
                  { label: "Yangi lid qo'shilganda email", checked: false },
                  { label: "Telegram bot bildirishnomalari", checked: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                    <span className="text-sm text-gray-700 dark:text-neutral-300">{item.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white dark:bg-neutral-900 after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </div>
                ))}
                <Button className="bg-blue-600 hover:bg-blue-700 mt-2">Saqlash</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
