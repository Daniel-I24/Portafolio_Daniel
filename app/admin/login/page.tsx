import { Character } from "@/components/ui/Character";
import { Icon } from "@/components/ui/Icon";
import { signIn } from "../actions";

const ERRORS: Record<string, string> = {
  denied: "Acceso denegado: esta cuenta no es la del dueño del portafolio. Cerré la sesión.",
  oauth: "GitHub no completó el inicio de sesión. Intenta de nuevo.",
};

interface LoginProps {
  searchParams: Promise<{ error?: string; setup?: string }>;
}

export default async function LoginPage({ searchParams }: LoginProps) {
  const { error, setup } = await searchParams;
  return (
    <main className="texture-concrete grid min-h-dvh place-items-center bg-concrete px-4 py-16">
      <div className="w-full max-w-md -rotate-1 border-[3px] border-ink bg-paper p-8 text-ink shadow-sticker-lg">
        <Character pose="laptop" className="mx-auto w-32" />
        <h1 className="mt-4 text-center font-spray text-4xl">Panel de Dani</h1>
        <p className="mt-2 text-center">Solo el dueño del portafolio puede entrar.</p>

        {error && (
          <p role="alert" className="mt-6 border-l-4 border-spray-red bg-spray-red/10 p-3 text-sm font-semibold">
            {ERRORS[error] ?? ERRORS.oauth}
          </p>
        )}
        {setup && (
          <div role="status" className="mt-6 border-l-4 border-denim bg-denim/10 p-3 text-sm">
            <p className="font-semibold">Configuración inicial: copia este id en la variable ADMIN_USER_ID y en la tabla admins.</p>
            <code className="mt-2 block break-all bg-ink px-2 py-1 font-mono text-xs text-mustard">{setup}</code>
          </div>
        )}

        <form action={signIn} className="mt-8 flex justify-center">
          <button type="submit" className="inline-flex items-center gap-3 border-[3px] border-ink bg-hoodie px-5 py-3 font-extrabold uppercase shadow-sticker transition-transform duration-150 hover:-translate-y-0.5 active:scale-y-90">
            <Icon name="github" size={22} /> Entrar con GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
