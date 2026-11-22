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
    <main className="grid min-h-dvh place-items-center bg-abyss px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-deep p-8 text-ice">
        <p aria-hidden className="mx-auto grid size-16 place-items-center rounded-full border-[1.5px] border-steel font-display text-2xl font-semibold">DI</p>
        <h1 className="mt-4 text-center font-display font-semibold text-4xl">Panel de Dani</h1>
        <p className="mt-2 text-center">Solo el dueño del portafolio puede entrar.</p>

        {error && (
          <p role="alert" className="mt-6 border-l-4 border-sky bg-sky/10 p-3 text-sm font-semibold">
            {ERRORS[error] ?? ERRORS.oauth}
          </p>
        )}
        {setup && (
          <div role="status" className="mt-6 border-l-4 border-sky bg-sky/10 p-3 text-sm">
            <p className="font-semibold">Configuración inicial: copia este id en la variable ADMIN_USER_ID y en la tabla admins.</p>
            <code className="mt-2 block break-all rounded bg-deep px-2 py-1 text-sm text-sky">{setup}</code>
          </div>
        )}

        <form action={signIn} className="mt-8 flex justify-center">
          <button type="submit" className="inline-flex items-center gap-3 rounded-full bg-navy px-6 py-3.5 font-semibold text-ice transition-colors duration-150 hover:bg-slate">
            <Icon name="github" size={22} /> Entrar con GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
