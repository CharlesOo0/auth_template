import { useGoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { Chrome, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { apiFetch } from "~/lib/api";
import { setUser, setTokens } from "~/lib/auth";
import { useNavigate } from "react-router";

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const googleMutation = useMutation({
    mutationFn: (accessToken: string) =>
      apiFetch("/google/", {
        method: "POST",
        body: JSON.stringify({ access_token: accessToken }),
      }),
    onSuccess: (data) => {
      if (data.access && data.refresh) {
        setTokens(data.access, data.refresh);
      }
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
    onSuccess: (tokenResponse) => {
      googleMutation.mutate(tokenResponse.access_token);
    },
    onError: (err) => {
      console.error("Google Login Error:", err);
      if (onError) {
        onError(err);
      }
    },
    flow: "implicit",
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
