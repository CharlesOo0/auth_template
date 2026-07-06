import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { LogOut, Rocket, User as UserIcon } from "lucide-react";
import { useAuth } from "~/context/auth-context";
import { useLogout } from "~/features/auth/hooks";

/**
 * Authenticated landing page. Intentionally blank for now - this is where
 * app features will be added.
 */
export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/"),
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background text-foreground font-sans">
      <nav className="w-full border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">SaaSify</span>
            </Link>

            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full">
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{user.username || user.email}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t("common.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            {t("dashboard.title", { name: user?.username || user?.email })}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
      </main>
    </div>
  );
}
