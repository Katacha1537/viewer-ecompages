'use client';
import usePageSearch from "@/hook/usePageSearch";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Page({ params }: { params: { slug: string } }) {
    const [hostName, setHostName] = useState<string>(""); // novo estado para o hostname
    const pathname = usePathname(); // Usando o pathname
    const { content, loading, error } = usePageSearch(hostName, pathname, params.slug);
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Garantir que o código que usa o window só rode no cliente
        if (typeof window !== "undefined") {
            const currentHostName = new URL(window.location.href).hostname;
            setHostName(currentHostName); // Atualiza o estado do hostName com o valor do cliente
        }
    }, []); // Executa apenas no carregamento inicial

    useEffect(() => {
        // Atualiza o innerHTML do canvasRef quando o conteúdo muda
        if (canvasRef.current && content) {
            canvasRef.current.innerHTML = content;
        }

        console.log(content);
    }, [content]); // Dependência do conteúdo

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
