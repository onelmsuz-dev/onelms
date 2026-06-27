"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">OneLMS</h1>
          <p className="text-sm text-gray-500 mt-1">Smart O'quv Markaz Tizimi</p>
        </div>

        <Card className="border-0 shadow-xl shadow-gray-100">
          <CardHeader className="pb-3 pt-6 px-6">
            <h2 className="text-lg font-semibold text-gray-900">Kirish</h2>
            <p className="text-sm text-gray-500">Tizimga kirish uchun ma'lumotlaringizni kiriting</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Telefon raqam</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="+998 90 000 0000"
                  defaultValue="+998 90 000 0000"
                  className="pl-9 h-10"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  defaultValue="demo1234"
                  className="pl-9 pr-9 h-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Link href="/dashboard">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 mt-2">
                Kirish
              </Button>
            </Link>

            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 text-center">
              Demo: istalgan telefon va parol bilan kirish mumkin
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          O'quv markaz yo'qmi?{" "}
          <a href="#" className="text-blue-600 hover:underline font-medium">
            Ariza qoldirish
          </a>
        </p>
      </div>
    </div>
  );
}
