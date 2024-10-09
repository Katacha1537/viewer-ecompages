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

            // Define todas as respostas como 'display: none'
            const answers = canvasRef.current.querySelectorAll('.faq1-answer') as NodeListOf<HTMLElement>;
            answers.forEach(answer => {
                answer.style.display = 'none';
            });

            // Script para alternar visibilidade das respostas
            const toggleButtons = canvasRef.current.querySelectorAll('.faq1-toggle-btn') as NodeListOf<HTMLButtonElement>;
            toggleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const answer = button.closest('.faq1-card')?.querySelector('.faq1-answer') as HTMLElement;
                    if (answer) {
                        answer.style.display = answer.style.display === "none" || answer.style.display === "" ? "block" : "none";
                        button.textContent = answer.style.display === "block" ? "-" : "+"; // Troca o sinal
                    }
                });
            });

            // Lógica do cronômetro
            const cronoElement = canvasRef.current.querySelector('#hero4-crono') as HTMLElement;
            if (cronoElement) {
                let hours = parseInt(cronoElement.children[0].children[0].textContent || "0");
                let minutes = parseInt(cronoElement.children[1].children[0].textContent || "0");
                let seconds = parseInt(cronoElement.children[2].children[0].textContent || "0");

                let totalTimeInSeconds = hours * 3600 + minutes * 60 + seconds;

                const interval = setInterval(() => {
                    hours = Math.floor(totalTimeInSeconds / 3600);
                    minutes = Math.floor((totalTimeInSeconds % 3600) / 60);
                    seconds = totalTimeInSeconds % 60;

                    cronoElement.children[0].children[0].textContent = String(hours).padStart(2, '0');
                    cronoElement.children[1].children[0].textContent = String(minutes).padStart(2, '0');
                    cronoElement.children[2].children[0].textContent = String(seconds).padStart(2, '0');

                    if (totalTimeInSeconds <= 0) {
                        clearInterval(interval);
                    } else {
                        totalTimeInSeconds--;
                    }
                }, 1000);
            }
        }

    }, [content]); // Dependência do conteúdo

    if (loading) {
        return (
            <div className="flex h-screen justify-center items-center">Carregando...</div>
        );
    }

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
        />
    );
}
