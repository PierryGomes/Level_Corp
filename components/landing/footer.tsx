import Image from "next/image"
import Link from "next/link"

const footerLinks = {
  Produto: [
    { label: "Recursos", href: "/#recursos" },
    { label: "Como Funciona", href: "/#como-funciona" },
    { label: "Precos", href: "/precos" },
    { label: "Integracao", href: "/integracao" },
  ],
  Empresa: [
    { label: "Sobre nos", href: "/sobre" },
    { label: "Blog", href: "/blog" },
    { label: "Carreiras", href: "/carreiras" },
    { label: "Contato", href: "/contato" },
  ],
  Legal: [
    { label: "Privacidade", href: "/privacidade" },
    { label: "Termos de Uso", href: "/termos" },
    { label: "Cookies", href: "/cookies" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt="LevelCorp"
                width={140}
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Transformando o engajamento corporativo com gamificacao,
              tecnologia e inteligencia artificial.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="mb-4 text-sm font-semibold text-foreground">{category}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/50 pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LevelCorp. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
