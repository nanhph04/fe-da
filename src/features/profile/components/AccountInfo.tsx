"use client";

import { useState } from "react";
import { CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileUser } from "../types/profile.types";
import { formatProfileDate } from "../utils/profile-formatters";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

interface AccountInfoProps {
  user: ProfileUser;
}

const getGenderLabel = (gender?: ProfileUser["gender"]) => {
  if (gender === "male") return "Nam";
  if (gender === "female" || gender === "women") return "Nữ";
  return "Chưa cập nhật";
};

export function AccountInfo({ user }: AccountInfoProps) {
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const items = [
    { label: "Email", value: user.email, icon: Mail },
    { label: "Số điện thoại", value: user.phone ? `+${user.phone}` : "Chưa cập nhật", icon: Phone },
    { label: "Giới tính", value: getGenderLabel(user.gender), icon: UserRound },
    { label: "Ngày sinh", value: formatProfileDate(user.birthday), icon: CalendarDays },
  ];

  return (
    <section>
      <h2 className="mb-6 flex items-center gap-3 font-headline text-xl font-bold text-foreground">
        <span className="h-6 w-1 rounded-full bg-primary" aria-hidden="true" />
        Thông tin tài khoản
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg border border-border/20 bg-card p-5 shadow-lg">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {item.label}
              </div>
              <p className="break-words font-medium text-foreground">{item.value}</p>
            </div>
          );
        })}

        <div className="md:col-span-2 rounded-lg border border-border/20 bg-card p-5 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Password Security</p>
              <p className="mt-2 font-black tracking-[0.5em] text-foreground">************</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setIsPasswordOpen(true)}>
              Đổi mật khẩu
            </Button>
          </div>
        </div>
      </div>

      <ChangePasswordDialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen} />
    </section>
  );
}
