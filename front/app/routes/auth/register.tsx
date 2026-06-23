import { Link } from "react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { apiFetch } from "~/lib/api";
import { setUser } from "~/lib/auth";
import { GoogleLoginButton } from "~/components/auth/google-login-button";

export default function Register() {
  const { t, i18n } = useTranslation();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const googleClientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || "", []);

  const registerSchema = z.object({
    username: z.string().min(3, t("auth.register.error")),
    email: z.string().email(t("auth.register.error")),
    password: z.string()
      .min(9, t("auth.register.passwordInvalid"))
      .regex(/[a-z]/, t("auth.register.passwordInvalid"))
      .regex(/[A-Z]/, t("auth.register.passwordInvalid"))
      .regex(/\d/, t("auth.register.passwordInvalid"))
      .regex(/[@$!%*?&]/, t("auth.register.passwordInvalid")),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.register.passwordMismatch"),
    path: ["confirmPassword"],
  });

  type RegisterValues = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => 
      apiFetch("/registration/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err: any) => {
      if (err.email && Array.isArray(err.email)) {
        setServerError(err.email.join(" "));
      } else if (err.username && Array.isArray(err.username)) {
        setServerError(err.username.join(" "));
      } else if (err.non_field_errors && Array.isArray(err.non_field_errors)) {
        setServerError(err.non_field_errors.join(" "));
      } else {
        setServerError(err.detail || t("auth.register.error"));
      }
    }
  });

  const onSubmit = (data: RegisterValues) => {
    setServerError(null);
    registerMutation.mutate({
      username: data.username,
      email: data.email,
      password1: data.password,
      password2: data.confirmPassword,
      language: i18n.language || 'fr',
    });
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden text-center p-8">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
            <CardTitle className="text-2xl mb-2">{t("auth.register.success")}</CardTitle>
            <p className="text-muted-foreground mb-8">
              {t("auth.register.subtitle")}
            </p>
            <Button asChild className="w-full rounded-xl py-6">
              <Link to="/auth/login">{t("auth.register.loginLink")}</Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

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
              {t("auth.register.title")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("auth.register.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">{t("auth.register.nameLabel")}</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  className="rounded-xl border-border/50 bg-background/50 focus:ring-primary/20"
                  {...register("username")}
                />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("auth.login.emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="rounded-xl border-border/50 bg-background/50 focus:ring-primary/20"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t("auth.login.passwordLabel")}</Label>
                <Input
                  id="password"
                  type="password"
                  className="rounded-xl border-border/50 bg-background/50 focus:ring-primary/20"
                  {...register("password")}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">{t("auth.register.confirmPasswordLabel")}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="rounded-xl border-border/50 bg-background/50 focus:ring-primary/20"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              {serverError && (
                <p className="text-sm font-medium text-destructive text-center">
                  {serverError}
                </p>
              )}

              <Button 
                type="submit" 
                className="w-full rounded-xl py-6 font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t("auth.register.submit")}
              </Button>
            </form>
            
            {googleClientId && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground italic">
                      {t("auth.common.or")}
                    </span>
                  </div>
                </div>

                <GoogleLoginButton 
                  onError={() => setServerError(t("auth.register.error"))}
                />
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8">
            <p className="text-sm text-muted-foreground text-center">
              {t("auth.register.haveAccount")}{" "}
              <Link to="/auth/login" className="text-primary font-semibold hover:underline underline-offset-4">
                {t("auth.register.loginLink")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}