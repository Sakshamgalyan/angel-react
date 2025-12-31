"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Cog, EarthLock, Key, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type MenuItem = {
  icon: string | React.ReactNode;
  label: string;
  href: string;
  visible: string[];
  action?: () => void;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const Menu = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || "guest";
  const menuItems: MenuSection[] = [
    {
      title: "Merchant",
      items: [
        { icon: <LayoutDashboard />, label: "Dashboard", href: "/home", visible: ["admin", "merchant"] },
        { icon: <Key />, label: "Angel Credentials", href: "/angel-credentials", visible: ["admin", "merchant"] },
      ],
    },
    {
      title: "Others",
      items: [
        { icon: <Cog />, label: "Admin Settings", href: "/admin-settings", visible: ["admin"] },
        { icon: <EarthLock />, label: "Privacy-Policy", href: "/privacy-policy", visible: ["admin", "merchant"] },
        { icon: <Cog />, label: "Settings", href: "/settings", visible: ["admin", "merchant"] },
      ],
    },
  ];

  return (
    <div className=" pl-3 pr-2 bg-gray-50 h-full w-1/8 text-xs lg:mx-1">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-bold my-4">
            {section.title}
          </span>
          {section.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 md:px-2 text-gray-500 hover:text-[var(--primary)] py-2 rounded-md hover:bg-[var(--primary)]/10 cursor-pointer transition-colors duration-200"
                  onClick={item.action ? item.action : undefined}
                >
                  {!item.action ? (
                    <Link href={item.href} className="flex items-center">
                      {typeof item.icon === "string" ? (
                        <Image src={item.icon} alt={item.label} width={20} height={20} />
                      ) : (
                        item.icon
                      )}
                      <span className="hidden lg:block mx-2 text-sm">{item.label}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center">
                      {typeof item.icon === "string" ? (
                        <Image src={item.icon} alt={item.label} width={20} height={20} />
                      ) : (
                        item.icon
                      )}
                      <span className="hidden lg:block mx-2 text-sm">{item.label}</span>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
