import { Link } from "react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Chrome } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export default function Login() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10" />

      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("common.backToHome", "Retour à l'accueil")}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 text-center pt-8">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {t("auth.login.title")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("auth.login.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-8">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("auth.login.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="rounded-xl border-border/50 bg-background/50 focus:ring-primary/20"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.login.passwordLabel")}</Label>
              </div>
              <Input
                id="password"
                type="password"
                className="rounded-xl border-border/50 bg-background/50 focus:ring-primary/20"
                required
              />
            </div>
            <Button className="w-full rounded-xl py-6 font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all hover:cursor-pointer">
              {t("auth.login.submit")}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground italic">
                  {t("auth.common.or")}
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full rounded-xl py-6 border-border/50 hover:bg-secondary/50 transition-all">
              <Chrome className="mr-2 h-4 w-4" />
              {t("auth.common.google")}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8">
            <p className="text-sm text-muted-foreground text-center">
              {t("auth.login.noAccount")}{" "}
              <Link to="/auth/register" className="text-primary font-semibold hover:underline underline-offset-4">
                {t("auth.login.registerLink")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}