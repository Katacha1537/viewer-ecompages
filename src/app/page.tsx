'use client'
import usePageSearch from "@/hook/usePageSearch";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [domainOrigin, setDomainOrigin] = useState("")
  const pathname = usePathname()
  const { content, loading, error } = usePageSearch(new URL(window.location.href).hostname, pathname, null)
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Atualiza o innerHTML do canvasRef quando o conteúdo muda
    if (canvasRef.current && content) {
      canvasRef.current.innerHTML = content;
    }

    console.log(content)

    // Pega o domínio atual sem o protocolo
    const url = new URL(window.location.href);
    const domain = url.hostname; // Apenas o domínio (sem https:// ou http://)
    setDomainOrigin(domain);
  }, [content, domainOrigin]); // Dependências atualizadas

  if (loading) return <div>CARREGANDO...</div>;

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center flex-col">
        <h2 className="text-5xl font-bold">Error</h2>
        <p className="text-xl mt-3">{error}</p>
      </div>
    );
  }

  return (
    <div
      id="editor"
      ref={canvasRef}
      style={{
        margin: '0px',
        maxWidth: '100%',
        minHeight: '1024px', // substitui tailwind
        outline: 'none', // previne o foco
      }}
    />
  );
}
