import { useGoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { Chrome, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { apiFetch } from "~/lib/api";
import { setUser } from "~/lib/auth";
import { useNavigate } from "react-router";

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const googleMutation = useMutation({
    mutationFn: (code: string) =>
      apiFetch("/google/", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    onSuccess: (data) => {
      setUser(data.user);
      
      if (data.user.language && i18n.language !== data.user.language) {
        i18n.changeLanguage(data.user.language);
      }
      
      if (onSuccess) {
        onSuccess(data.user);
      } else {
        navigate("/");
      }
    },
    onError: (err) => {
      if (onError) {
        onError(err);
      }
    },
  });

  const loginWithGoogle = useGoogleLogin({
    // Authorization-code flow: the browser only ever sees a short-lived,
    // single-use code, never a raw access token. The backend
    // (authentication/views.py::GoogleLogin) exchanges it server-side using
    // the app's client secret - see callback_url='postmessage' there for
    // why the redirect_uri must be that literal string for this popup flow.
    flow: "auth-code",
    onSuccess: (codeResponse) => {
      googleMutation.mutate(codeResponse.code);
    },
    onError: (err) => {
      console.error("Google Login Error:", err);
      if (onError) {
        onError(err);
      }
    },
  });

  return (
    <Button 
      variant="outline" 
      className="w-full rounded-xl py-6 border-border/50 hover:bg-secondary/50 transition-all hover:cursor-pointer"
      onClick={() => loginWithGoogle()}
      disabled={googleMutation.isPending}
    >
      {googleMutation.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Chrome className="mr-2 h-4 w-4" />
      )}
      {t("auth.common.google")}
    </Button>
  );
}
