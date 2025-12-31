import { ReduxProvider } from "@/store/ReduxProvider";
import AuthInitializer from "@/components/AuthInitializer";
import { AuthProvider } from "@/context/auth";
import { AuthFormProvider } from "@/context/auth/AuthFormContext";
import ThemeWrapper from "@/components/ThemeWrapper";

export default function dashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <ReduxProvider>
          <AuthInitializer />
          <AuthProvider>
            <AuthFormProvider>
              <ThemeWrapper>
                {children}
              </ThemeWrapper>
            </AuthFormProvider>
          </AuthProvider>
        </ReduxProvider>
  );
}
